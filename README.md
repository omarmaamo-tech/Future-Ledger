# Future Ledger

Future Ledger is a personal finance planning app for tracking recurring expenses, payment status, reminders, and year-end summaries.

## Project structure

- `artifacts/futureledger-planner` — main React/Vite web app
- `lib/db` — Drizzle database schema, including expenses and payment history
- `lib/api-*` — shared API types and client helpers
- `scripts` — workspace tooling

## Local development

Install dependencies with pnpm, then run the planner from its package directory:

```bash
pnpm install
cd artifacts/futureledger-planner
pnpm dev
```

The app currently stores the interactive planner data locally in the browser. The database schema is prepared for the next backend integration step.
