import { useCallback, useEffect, useState } from 'react';

export type Reminder = { daysBefore: number; localTime: string } | null;
export type Expense = {
  id: string;
  name: string;
  amountCents: number;
  dueDate: string;
  recurrence: 'once' | 'monthly';
  reminder: Reminder;
  paidDates: string[];
  createdAt: string;
  updatedAt: string;
};

const EXPENSES_KEY = 'futureledger-planner-expenses';
const DELIVERY_KEY = 'futureledger-planner-deliveries';

function readExpenses(): Expense[] {
  try {
    const stored = localStorage.getItem(EXPENSES_KEY);
    const parsed = stored ? (JSON.parse(stored) as Expense[]) : [];
    return Array.isArray(parsed) ? parsed.map((expense) => ({ ...expense, paidDates: Array.isArray(expense.paidDates) ? expense.paidDates : [] })) : [];
  } catch {
    return [];
  }
}

function readDeliveryKeys(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DELIVERY_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(readExpenses);

  useEffect(() => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const saveExpense = useCallback((draft: Omit<Expense, 'createdAt' | 'updatedAt' | 'paidDates'> & { paidDates?: string[] }, existing?: Expense) => {
    const now = new Date().toISOString();
    const expense: Expense = {
      ...draft,
      paidDates: draft.paidDates ?? existing?.paidDates ?? [],
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    setExpenses((current) => existing
      ? current.map((item) => item.id === existing.id ? expense : item)
      : [...current, expense]);
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  }, []);

  const togglePaid = useCallback((id: string, date: string) => {
    setExpenses((current) => current.map((expense) => {
      if (expense.id !== id) return expense;
      const paidDates = expense.paidDates.includes(date)
        ? expense.paidDates.filter((paidDate) => paidDate !== date)
        : [...expense.paidDates, date];
      return { ...expense, paidDates, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const loadDemoData = useCallback(() => {
    const today = new Date();
    const dateAfter = (days: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    const now = new Date().toISOString();
    setExpenses([
      { id: crypto.randomUUID(), name: 'Rent', amountCents: 185000, dueDate: dateAfter(12), recurrence: 'monthly', reminder: { daysBefore: 3, localTime: '09:00' }, paidDates: [], createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), name: 'Electricity', amountCents: 14200, dueDate: dateAfter(16), recurrence: 'monthly', reminder: { daysBefore: 2, localTime: '09:00' }, paidDates: [], createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), name: 'Car insurance', amountCents: 19200, dueDate: dateAfter(20), recurrence: 'once', reminder: null, paidDates: [], createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), name: 'Streaming bundle', amountCents: 2900, dueDate: dateAfter(24), recurrence: 'monthly', reminder: null, paidDates: [], createdAt: now, updatedAt: now },
    ]);
  }, []);

  const sendDueReminders = useCallback(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date();
    const delivered = new Set(readDeliveryKeys());
    const newDeliveries: string[] = [];
    for (const expense of expenses) {
      if (!expense.reminder) continue;
      const future = getOccurrences(expense, now, 18);
      for (const occurrence of future) {
        const deliveryKey = `${expense.id}:${occurrence.date}`;
        if (delivered.has(deliveryKey)) continue;
        const due = parseDate(occurrence.date);
        due.setDate(due.getDate() - expense.reminder.daysBefore);
        const [hours, minutes] = expense.reminder.localTime.split(':').map(Number);
        due.setHours(hours, minutes, 0, 0);
        if (due <= now && parseDate(occurrence.date) >= startOfDay(now)) {
          new Notification(`Upcoming: ${expense.name}`, {
            body: `${formatDate(occurrence.date)} · ${formatCurrency(expense.amountCents)}`,
          });
          newDeliveries.push(deliveryKey);
          delivered.add(deliveryKey);
        }
      }
    }
    if (newDeliveries.length) {
      localStorage.setItem(DELIVERY_KEY, JSON.stringify([...delivered]));
    }
  }, [expenses]);

  return { expenses, saveExpense, deleteExpense, togglePaid, loadDemoData, sendDueReminders };
}

export function isPaid(expense: Expense, date: string): boolean {
  return expense.paidDates.includes(date);
}

export type Occurrence = { expense: Expense; date: string };

export function getOccurrences(expense: Expense, from = new Date(), months = 18): Occurrence[] {
  if (expense.recurrence === 'once') return [{ expense, date: expense.dueDate }];
  const anchor = parseDate(expense.dueDate);
  const anchorDay = anchor.getDate();
  const result: Occurrence[] = [];
  const firstMonth = new Date(from.getFullYear(), from.getMonth(), 1);
  const anchorMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = firstMonth > anchorMonth ? firstMonth : anchorMonth;
  for (let offset = 0; offset < months; offset += 1) {
    const month = new Date(start.getFullYear(), start.getMonth() + offset, 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const date = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(Math.min(anchorDay, lastDay)).padStart(2, '0')}`;
    if (parseDate(date) >= startOfDay(from)) result.push({ expense, date });
  }
  return result;
}

export function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions): string {
  return parseDate(value).toLocaleDateString(undefined, options ?? {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatCurrency(amountCents: number): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amountCents / 100);
}
