# Task Board

A small full-stack app for learning how a modern Node.js stack fits together: **Next.js UI**, **Route Handler APIs**, and a **relational database** via **Prisma + SQLite**.

You can create projects, add people, and move tasks across a board. Every mutation goes through an HTTP API that reads and writes related tables.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js Route Handlers in `src/app/api` |
| Database | SQLite + Prisma ORM (`Project`, `Person`, `Task`) |

## Quick start

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

Useful scripts:

- `npm run dev` — app on port `43127`
- `npm run db:seed` — reset sample projects, people, and tasks
- `npm run db:reset` — recreate the database from migrations and seed

## Learning notes

Detailed notes for each stack role live in [`notes/`](./notes/README.md) — TypeScript, Next.js, React, Tailwind/shadcn, Route Handlers, Prisma, SQLite, request lifecycle, and tooling.

## How the pieces connect

```text
Browser (React pages)
   │  fetch JSON
   ▼
Route Handlers  (/api/projects, /api/tasks, /api/people)
   │  Prisma Client
   ▼
SQLite tables   (Project 1—N Task, Person 1—N Task)
```

1. **Frontend** — pages under `src/app` render client components that call `fetch`. Forms create/update/delete records, then refresh local state.
2. **Backend** — handlers under `src/app/api` validate input, return status codes, and talk to Prisma. Look at `src/app/api/tasks/route.ts` for create validation.
3. **Database** — `prisma/schema.prisma` defines tables and foreign keys. Migrations live in `prisma/migrations`. Seed data is in `prisma/seed.ts`.

### Relations to notice

- A **Project** has many **Tasks** (`projectId`).
- A **Person** can be assigned to many **Tasks** (`assigneeId`, optional).
- Deleting a project cascades to its tasks; deleting a person clears assignees.

When an API loads a project board it uses Prisma `include` to join tasks and assignees in one query (`src/app/api/projects/[id]/route.ts`).

## App map

| Route | Purpose |
| --- | --- |
| `/` | List and create projects |
| `/projects/[id]` | Kanban-style board for one project |
| `/people` | Shared assignee roster |

## Switching to PostgreSQL later

SQLite keeps setup frictionless for learning. To use Postgres:

1. Change `provider` in `prisma/schema.prisma` to `postgresql`.
2. Set `DATABASE_URL` to your Postgres connection string.
3. Run `npx prisma migrate dev`.

The application code (API routes and UI) stays the same — only the database connection changes.
