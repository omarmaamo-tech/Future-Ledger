import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Bell, CalendarDays, Check, CirclePlus, Clock3, Pencil, Repeat2, ShieldCheck, Trash2 } from 'lucide-react';
import { Badge } from '@workspace/futureledger/components/ui/badge';
import { Button } from '@workspace/futureledger/components/ui/button';
import { Card, CardContent } from '@workspace/futureledger/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/futureledger/components/ui/dialog';
import { Input } from '@workspace/futureledger/components/ui/input';
import { Label } from '@workspace/futureledger/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/futureledger/components/ui/select';
import { Switch } from '@workspace/futureledger/components/ui/switch';
import { toast } from '@workspace/futureledger/hooks/use-toast';
import { formatCurrency, formatDate, getOccurrences, isPaid, parseDate, type Expense, useExpenses } from '@/hooks/use-expenses';

type ExpenseForm = {
  name: string;
  amount: string;
  dueDate: string;
  recurrence: 'once' | 'monthly';
  reminderEnabled: boolean;
  daysBefore: string;
  localTime: string;
};
type ExpenseFilter = 'all' | 'upcoming' | 'paid' | 'recurring';

const blankForm = (): ExpenseForm => ({
  name: '', amount: '', dueDate: '', recurrence: 'once',
  reminderEnabled: false, daysBefore: '1', localTime: '09:00',
});

export default function HomePage() {
  const { expenses, saveExpense, deleteExpense, togglePaid, loadDemoData, sendDueReminders } = useExpenses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>();
  const [form, setForm] = useState<ExpenseForm>(blankForm);
  const [deleteTarget, setDeleteTarget] = useState<Expense | undefined>();
  const [expenseFilter, setExpenseFilter] = useState<ExpenseFilter>('all');
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    'Notification' in window ? Notification.permission : 'unsupported',
  );

  useEffect(() => {
    sendDueReminders();
    const timer = window.setInterval(sendDueReminders, 30_000);
    return () => window.clearInterval(timer);
  }, [sendDueReminders]);

  const upcoming = useMemo(() => expenses
    .flatMap((expense) => getOccurrences(expense, new Date(), 12))
    .filter((item) => parseDate(item.date) >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8), [expenses]);

  const monthSummary = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const dueThisMonthCents = expenses
      .flatMap((expense) => getOccurrences(expense, monthStart, 1))
      .filter(({ date }) => {
        const parsed = parseDate(date);
        return parsed >= monthStart && parsed <= monthEnd;
      })
      .reduce((total, { expense }) => total + expense.amountCents, 0);
    const monthOccurrences = expenses
      .flatMap((expense) => getOccurrences(expense, monthStart, 1))
      .filter(({ date }) => {
        const parsed = parseDate(date);
        return parsed >= monthStart && parsed <= monthEnd;
      });
    const paidThisMonthCents = monthOccurrences.filter(({ expense, date }) => isPaid(expense, date)).reduce((total, { expense }) => total + expense.amountCents, 0);
    return {
      dueThisMonthCents,
      paidThisMonthCents,
      remainingThisMonthCents: Math.max(0, dueThisMonthCents - paidThisMonthCents),
    };
  }, [expenses]);
  const visibleExpenses = useMemo(() => expenses.filter((expense) => {
    const nextDate = expense.recurrence === 'once' ? expense.dueDate : getOccurrences(expense)[0]?.date ?? expense.dueDate;
    if (expenseFilter === 'paid') return isPaid(expense, nextDate);
    if (expenseFilter === 'upcoming') return !isPaid(expense, nextDate);
    if (expenseFilter === 'recurring') return expense.recurrence === 'monthly';
    return true;
  }), [expenses, expenseFilter]);

  function openCreate() {
    setEditing(undefined);
    setForm(blankForm());
    setDialogOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setForm({
      name: expense.name,
      amount: (expense.amountCents / 100).toFixed(2),
      dueDate: expense.dueDate,
      recurrence: expense.recurrence,
      reminderEnabled: Boolean(expense.reminder),
      daysBefore: String(expense.reminder?.daysBefore ?? 1),
      localTime: expense.reminder?.localTime ?? '09:00',
    });
    setDialogOpen(true);
  }

  async function toggleReminder(enabled: boolean) {
    if (!enabled) {
      setForm((value) => ({ ...value, reminderEnabled: false }));
      return;
    }
    if (!('Notification' in window)) {
      setPermission('unsupported');
      toast({ title: 'Notifications unavailable', description: 'This browser does not support notifications.' });
      return;
    }
    const result = Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission;
    setPermission(result);
    if (result === 'granted') {
      setForm((value) => ({ ...value, reminderEnabled: true }));
    } else {
      toast({ title: 'Permission not granted', description: 'Allow notifications in your browser settings to enable reminders.' });
    }
  }

  function submitExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amountCents = Math.round(Number(form.amount) * 100);
    if (!form.name.trim() || !Number.isFinite(amountCents) || amountCents <= 0 || !form.dueDate) {
      toast({ title: 'Check your expense', description: 'Add a name, a valid amount, and a due date.' });
      return;
    }
    saveExpense({
      id: editing?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      amountCents,
      dueDate: form.dueDate,
      recurrence: form.recurrence,
      reminder: form.reminderEnabled
        ? { daysBefore: Number(form.daysBefore), localTime: form.localTime }
        : null,
    }, editing);
    toast({ title: editing ? 'Expense updated' : 'Expense added', description: 'Your planner is saved on this device.' });
    setDialogOpen(false);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteExpense(deleteTarget.id);
    toast({ title: 'Expense deleted', description: `${deleteTarget.name} was removed from this device.` });
    setDeleteTarget(undefined);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">YOUR PERSONAL EXPENSE PLANNER</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Plan ahead, feel ready.</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">A clear view of what is coming up, with every expense kept private on this device.</p>
        </div>
        <Button onClick={openCreate} data-testid="button-add-expense">
          <CirclePlus className="mr-2 h-4 w-4" /> Add expense
        </Button>
      </div>

      <Card className="mb-6 border-0 bg-primary text-primary-foreground">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Private by design</p>
              <p className="mt-1 max-w-2xl text-sm text-primary-foreground/75">Your expenses and reminder settings stay in this browser. There is no account or cloud sync.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
            <Bell className="h-4 w-4" />
            {permission === 'unsupported' ? 'Notifications unavailable' : permission === 'denied' ? 'Notifications blocked' : 'Reminders run while this app is open'}
          </div>
        </CardContent>
      </Card>

      <section className="mb-10 grid gap-3 sm:grid-cols-3" aria-label="Expense summary">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Due this month</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{formatCurrency(monthSummary.dueThisMonthCents)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Based on saved due dates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Paid this month</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{formatCurrency(monthSummary.paidThisMonthCents)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Marked as complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Remaining this month</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{formatCurrency(monthSummary.remainingThisMonthCents)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Still on your radar</p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Coming up</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your next due dates, one-time and monthly.</p>
          </div>
          <Badge variant="secondary">{upcoming.length} upcoming</Badge>
        </div>
        {upcoming.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map(({ expense, date }) => (
              <Card key={`${expense.id}:${date}`} data-testid={`card-upcoming-${expense.id}-${date}`}>
                <CardContent className="p-4">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      {expense.recurrence === 'monthly' ? <Repeat2 className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                    </div>
                    {expense.reminder && <Bell className="mt-1 h-4 w-4 text-muted-foreground" aria-label="Reminder enabled" />}
                  </div>
                  <p className="truncate font-medium" data-testid={`text-upcoming-name-${expense.id}-${date}`}>{expense.name}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">{formatCurrency(expense.amountCents)}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{formatDate(date, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <Button className="mt-3 w-full" size="sm" variant={isPaid(expense, date) ? 'secondary' : 'outline'} onClick={() => togglePaid(expense.id, date)}>
                    <Check className="mr-2 h-4 w-4" /> {isPaid(expense, date) ? 'Paid' : 'Mark paid'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center px-6 py-10 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted"><CalendarDays className="h-5 w-5" /></div>
              <h3 className="font-medium">Nothing on the calendar yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Add a bill or expense to see what is coming up. Your planner starts with your real data.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2"><Button variant="outline" onClick={openCreate} data-testid="button-add-first-expense">Add your first expense</Button><Button variant="ghost" onClick={loadDemoData}>Preview with sample data</Button></div>
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Your expenses</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage schedules and reminder preferences.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={expenseFilter} onValueChange={(value: ExpenseFilter) => setExpenseFilter(value)}>
              <SelectTrigger className="w-36" aria-label="Filter expenses"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All expenses</SelectItem><SelectItem value="upcoming">Upcoming</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="recurring">Recurring</SelectItem></SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{visibleExpenses.length} {visibleExpenses.length === 1 ? 'expense' : 'expenses'}</span>
          </div>
        </div>
        {expenses.length === 0 ? (
          <Card><CardContent className="py-6 text-sm text-muted-foreground">Expenses you add will appear here.</CardContent></Card>
        ) : visibleExpenses.length === 0 ? (
          <Card><CardContent className="py-6 text-sm text-muted-foreground">No expenses match this filter.</CardContent></Card>
        ) : (
          <Card>
            <CardContent className="divide-y p-0">
              {visibleExpenses.slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((expense) => (
                <div key={expense.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5" data-testid={`row-expense-${expense.id}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      {expense.recurrence === 'monthly' ? <Repeat2 className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium" data-testid={`text-expense-name-${expense.id}`}>{expense.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Next: {formatDate(expense.recurrence === 'once' ? expense.dueDate : getOccurrences(expense)[0]?.date ?? expense.dueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(expense.amountCents)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{expense.recurrence === 'monthly' ? 'Monthly' : 'One-time'}{expense.reminder ? ` · ${expense.reminder.daysBefore}d reminder` : ''}</p>
                    </div>
                    <Button variant={isPaid(expense, expense.recurrence === 'once' ? expense.dueDate : getOccurrences(expense)[0]?.date ?? expense.dueDate) ? 'secondary' : 'outline'} size="sm" onClick={() => togglePaid(expense.id, expense.recurrence === 'once' ? expense.dueDate : getOccurrences(expense)[0]?.date ?? expense.dueDate)}>
                      <Check className="mr-2 h-4 w-4" /> {isPaid(expense, expense.recurrence === 'once' ? expense.dueDate : getOccurrences(expense)[0]?.date ?? expense.dueDate) ? 'Paid' : 'Mark paid'}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(expense)} aria-label={`Edit ${expense.name}`} data-testid={`button-edit-expense-${expense.id}`}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(expense)} aria-label={`Delete ${expense.name}`} data-testid={`button-delete-expense-${expense.id}`}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit expense' : 'Add an expense'}</DialogTitle>
            <DialogDescription>Keep a bill on your radar with its due date and schedule.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitExpense} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="expense-name">Expense name</Label>
              <Input id="expense-name" data-testid="input-expense-name" placeholder="e.g. Rent" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount (USD)</Label>
                <Input id="expense-amount" data-testid="input-expense-amount" type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-date">First due date</Label>
                <Input id="expense-date" data-testid="input-expense-due-date" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Schedule</Label>
              <Select value={form.recurrence} onValueChange={(value: 'once' | 'monthly') => setForm({ ...form, recurrence: value })}>
                <SelectTrigger data-testid="select-expense-recurrence"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">One-time expense</SelectItem>
                  <SelectItem value="monthly">Repeats monthly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Monthly due dates stay anchored to the first date; shorter months use their last day.</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div><p className="text-sm font-medium">Remind me before it is due</p><p className="mt-1 text-xs text-muted-foreground">Notifications are delivered only while this app is open.</p></div>
                </div>
                <Switch checked={form.reminderEnabled} onCheckedChange={toggleReminder} aria-label="Enable expense reminder" data-testid="switch-expense-reminder" />
              </div>
              {form.reminderEnabled && (
                <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reminder-days">Days before</Label>
                    <Input id="reminder-days" type="number" min="0" max="30" value={form.daysBefore} onChange={(event) => setForm({ ...form, daysBefore: event.target.value })} data-testid="input-reminder-days" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminder-time">Local time</Label>
                    <Input id="reminder-time" type="time" value={form.localTime} onChange={(event) => setForm({ ...form, localTime: event.target.value })} data-testid="input-reminder-time" />
                  </div>
                </div>
              )}
              {permission === 'denied' && <p className="mt-3 text-xs text-destructive">Notifications are blocked in browser settings. Change that setting before enabling reminders.</p>}
              {permission === 'unsupported' && <p className="mt-3 text-xs text-destructive">This browser does not support notifications.</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-expense">Cancel</Button>
              <Button type="submit" data-testid="button-save-expense">{editing ? 'Save changes' : 'Add expense'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(undefined)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete this expense?</DialogTitle><DialogDescription>{deleteTarget?.name} and its future schedule will be removed from this device.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(undefined)} data-testid="button-cancel-delete">Keep expense</Button>
            <Button variant="destructive" onClick={confirmDelete} data-testid="button-confirm-delete">Delete expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
