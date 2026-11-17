# Futureledger

Futureledger is a design system for a future-expense planner where people can add and edit upcoming bills.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/futureledger/` — shared design-system artifact and living style guide
- `artifacts/futureledger/tokens.json` — source of truth for light/dark colors, typography, spacing, and radius
- `artifacts/futureledger/docs/AGENTS.md` — consumption guidance and visual direction

## Architecture decisions

- The design system is the shared source of truth; consuming apps should import its components and tokens instead of copying them.

## Product

- Supports a future-expense planner visual language, including dated bills such as rent due on October 31.
- Uses an Uber-inspired high-contrast black-and-white direction with a navy-blue accent; do not use Uber's logo or imply affiliation.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
