# Stack Overview

This project is a **Task Board**: projects, tasks, and people. It is intentionally small so you can see how a modern full-stack Node.js app is wired end to end.

## The big picture

```text
Browser (React UI)
   │  HTTP JSON (fetch)
   ▼
Next.js Route Handlers  (/api/...)
   │  Prisma Client
   ▼
SQLite database         (tables + foreign keys)
```

| Layer | Role in this app | Where to look |
| --- | --- | --- |
| TypeScript | Shared language for UI and API | Almost every `.ts` / `.tsx` file |
| Next.js (App Router) | Hosts pages **and** API routes in one Node app | `src/app/` |
| React | Interactive UI: forms, boards, dialogs | `src/components/` |
| Tailwind CSS | Utility styling | `src/app/globals.css`, class names in components |
| shadcn/ui | Ready-made accessible UI primitives | `src/components/ui/` |
| Route Handlers | Backend HTTP API | `src/app/api/` |
| Prisma | ORM: schema, migrations, typed queries | `prisma/`, `src/lib/prisma.ts` |
| SQLite | Relational database file | `prisma/dev.db` (local, gitignored) |

## Why this stack?

- **One repo, one language (TypeScript)** — you do not context-switch between Python/Go for the API and JavaScript for the UI.
- **Next.js as the Node server** — pages and APIs share the same process in development; great for learning request/response without standing up Express separately.
- **Relational data with Prisma** — you practice foreign keys, joins (`include`), and migrations the way production Node apps usually do, without writing raw SQL first.
- **SQLite for local learning** — no Docker or cloud DB required; the same Prisma code can later point at PostgreSQL.

## Suggested reading order

1. [01-typescript.md](./01-typescript.md) — language and types across the stack  
2. [02-nextjs.md](./02-nextjs.md) — app structure and routing  
3. [03-react-frontend.md](./03-react-frontend.md) — UI state and `fetch`  
4. [04-tailwind-and-shadcn.md](./04-tailwind-and-shadcn.md) — styling and components  
5. [05-api-route-handlers.md](./05-api-route-handlers.md) — backend HTTP layer  
6. [06-prisma-orm.md](./06-prisma-orm.md) — talking to the database  
7. [07-sqlite-relational-db.md](./07-sqlite-relational-db.md) — tables and relations  
8. [08-request-lifecycle.md](./08-request-lifecycle.md) — one feature traced end to end  
9. [09-tooling-and-scripts.md](./09-tooling-and-scripts.md) — npm scripts, env, migrations  

## Mental model: who owns what?

- **Frontend owns presentation and user intent** — “user clicked Create project with this name.”
- **API owns validation and status codes** — reject empty titles, return `400` / `404` / `201`.
- **Database owns durable truth** — after a refresh, projects and tasks are still there because they were written to SQLite.

If a piece of data must survive a reload, it must go through the API into the database — not live only in React state.
