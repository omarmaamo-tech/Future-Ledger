import { createInsertSchema } from "drizzle-zod";
import { boolean, date, integer, jsonb, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { z } from "zod";

export const recurrenceEnum = pgEnum("expense_recurrence", ["once", "monthly"]);

export const expensesTable = pgTable("expenses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  amountCents: integer("amount_cents").notNull(),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  recurrence: recurrenceEnum("recurrence").notNull().default("once"),
  reminderEnabled: boolean("reminder_enabled").notNull().default(false),
  reminderDaysBefore: integer("reminder_days_before"),
  reminderLocalTime: varchar("reminder_local_time", { length: 5 }),
  paidDates: jsonb("paid_dates").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expensesTable, {
  name: (schema) => schema.trim().min(1).max(160),
  amountCents: (schema) => schema.int().positive(),
  dueDate: (schema) => schema.regex(/^\d{4}-\d{2}-\d{2}$/),
  reminderDaysBefore: (schema) => schema.int().min(0).max(365).nullable(),
  reminderLocalTime: (schema) => schema.regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable(),
}).omit({ createdAt: true, updatedAt: true });

export const expenseIdSchema = z.object({ id: z.string().uuid() });

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expensesTable.$inferSelect;
