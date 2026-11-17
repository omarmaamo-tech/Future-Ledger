import { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, ReceiptText } from 'lucide-react';
import { Badge } from '@workspace/futureledger/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/futureledger/components/ui/card';
import { Label } from '@workspace/futureledger/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/futureledger/components/ui/select';
import { formatCurrency, getOccurrences, isPaid, parseDate, useExpenses } from '@/hooks/use-expenses';

const monthNames = Array.from({ length: 12 }, (_, month) =>
  new Date(2024, month, 1).toLocaleDateString(undefined, { month: 'long' }),
);

export default function YearEndPage() {
  const { expenses } = useExpenses();
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const selectedYear = Number(year);
  const monthTotals = useMemo(() => {
    const totals = Array.from({ length: 12 }, () => 0);
    for (const expense of expenses) {
      const occurrences = getOccurrences(expense, new Date(selectedYear, 0, 1), 12);
      for (const occurrence of occurrences) {
        const date = parseDate(occurrence.date);
        if (date.getFullYear() === selectedYear) totals[date.getMonth()] += expense.amountCents;
      }
    }
    return totals;
  }, [expenses, selectedYear]);
  const monthPaidTotals = useMemo(() => {
    const totals = Array.from({ length: 12 }, () => 0);
    for (const expense of expenses) {
      const occurrences = getOccurrences(expense, new Date(selectedYear, 0, 1), 12);
      for (const occurrence of occurrences) {
        const date = parseDate(occurrence.date);
        if (date.getFullYear() === selectedYear && isPaid(expense, occurrence.date)) totals[date.getMonth()] += expense.amountCents;
      }
    }
    return totals;
  }, [expenses, selectedYear]);
  const annualTotal = monthTotals.reduce((sum, total) => sum + total, 0);
  const annualPaid = monthPaidTotals.reduce((sum, total) => sum + total, 0);
  const annualRemaining = Math.max(0, annualTotal - annualPaid);
  const maxMonth = Math.max(...monthTotals, 1);
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const available = new Set(Array.from({ length: 21 }, (_, index) => currentYear - 10 + index));
    expenses.forEach((expense) => available.add(parseDate(expense.dueDate).getFullYear()));
    return Array.from(available).sort((a, b) => b - a);
  }, [currentYear, expenses]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">A YEAR IN VIEW</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Year-end overview</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">Understand the bills scheduled to land in each month. Totals reflect due dates, not estimates.</p>
        </div>
        <div className="w-full space-y-2 sm:w-44">
          <Label htmlFor="year-select">Calendar year</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger id="year-select" data-testid="select-calendar-year"><SelectValue /></SelectTrigger>
            <SelectContent>{years.map((item) => <SelectItem key={item} value={String(item)}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <Card className="mb-6 overflow-hidden border-0 bg-primary text-primary-foreground">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <div className="mb-5 flex items-center gap-2 text-sm text-primary-foreground/75"><CalendarDays className="h-4 w-4" /> Calendar year {selectedYear}</div>
            <p className="text-sm font-medium text-primary-foreground/75">SCHEDULED EXPENSES</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl" data-testid="text-annual-total">{formatCurrency(annualTotal)}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-primary-foreground/75 sm:text-right"><div><p className="text-xs uppercase tracking-wide text-primary-foreground/60">Paid</p><p className="mt-1 font-semibold text-primary-foreground">{formatCurrency(annualPaid)}</p></div><div><p className="text-xs uppercase tracking-wide text-primary-foreground/60">Remaining</p><p className="mt-1 font-semibold text-primary-foreground">{formatCurrency(annualRemaining)}</p></div><div className="col-span-2 flex items-center gap-2"><ReceiptText className="h-4 w-4" /> Based on {expenses.length} saved {expenses.length === 1 ? 'expense' : 'expenses'}</div></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div><CardTitle>Month by month</CardTitle><p className="mt-1 text-sm text-muted-foreground">Each payment is counted on its actual due date.</p></div>
          <Badge variant="secondary">{selectedYear}</Badge>
        </CardHeader>
        <CardContent className="space-y-1">
          {monthTotals.map((total, index) => (
            <div key={monthNames[index]} className="grid grid-cols-[5rem_1fr_auto] items-center gap-3 border-t py-3 sm:grid-cols-[7rem_1fr_auto] sm:gap-5" data-testid={`row-month-${index + 1}`}>
              <span className="text-sm font-medium">{monthNames[index]}</span>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                {total > 0 && <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.max(2, (total / maxMonth) * 100)}%` }} />}
              </div>
              <span className="min-w-24 text-right text-sm font-medium tabular-nums" data-testid={`text-month-total-${index + 1}`}>{formatCurrency(total)}<span className="mt-1 block text-xs font-normal text-muted-foreground">{formatCurrency(monthPaidTotals[index])} paid</span></span>
            </div>
          ))}
          <div className="mt-3 flex items-center justify-between border-t pt-5 font-semibold">
            <span>Total for {selectedYear}</span><span className="text-lg tabular-nums" data-testid="text-year-summary">{formatCurrency(annualTotal)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>Monthly schedules count only the occurrences whose due dates fall in {selectedYear}. One-time expenses are counted once, in the year they are due.</p>
      </div>
    </main>
  );
}
