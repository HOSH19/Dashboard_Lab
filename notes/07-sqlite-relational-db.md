# SQLite — Relational Database

## Role

SQLite stores the **durable data** for the Task Board in a single local file (`prisma/dev.db`). It is a real **relational database**: tables, primary keys, foreign keys, and constraints.

In production many teams use **PostgreSQL**. Prisma lets you keep almost the same application code and switch the provider later. SQLite is ideal for learning because setup is zero-ops.

## Connection

`.env` (from `.env.example`):

```env
DATABASE_URL="file:./dev.db"
```

The path is relative to the `prisma/` directory. The DB file is gitignored so each machine has its own data.

## Tables (models)

Defined in `prisma/schema.prisma`:

```text
Project 1────* Task *────0..1 Person
```

| Table | Meaning |
| --- | --- |
| `Project` | A board container (`name`, `description`) |
| `Person` | Someone who can be assigned (`name`, unique `email`) |
| `Task` | Work item belonging to one project, optional assignee |

### Keys and relations

- Every row has a string `id` (`cuid()`).
- `Task.projectId` → `Project.id` (**required**, `onDelete: Cascade`)
- `Task.assigneeId` → `Person.id` (**optional**, `onDelete: SetNull`)

Cascade means: delete a project and its tasks disappear with it.  
SetNull means: delete a person and their tasks remain, but become unassigned.

### Enums as strings (learning choice)

`status` and `priority` are stored as strings with defaults (`todo`, `medium`). The API enforces allowed values. You could later promote them to DB enums (especially on Postgres).

## Why “relational” matters here

Without relations you might store `assigneeName` as plain text on every task and get inconsistent spellings. With a `Person` table:

- One source of truth for a human
- Tasks point at `assigneeId`
- Listing people with task counts uses a join/count across tables

Seeded data in `prisma/seed.ts` creates people first, then projects with nested tasks that reference those people — that is relational thinking in practice.

## Migrations

`prisma/migrations/.../migration.sql` is the historical SQL that created the tables. Commands:

```bash
npx prisma migrate dev     # apply / create migrations in development
npm run db:seed            # insert sample rows
npm run db:reset           # wipe, re-migrate, seed
```

Treat migrations as **version control for your schema**.

## Inspecting data

- `npx prisma studio` — browser UI over tables
- SQLite CLI (if installed): `sqlite3 prisma/dev.db '.tables'`

## Switching mindset to PostgreSQL

1. Change `provider = "postgresql"` in the schema  
2. Point `DATABASE_URL` at Postgres  
3. Run migrations again  

Application Route Handlers largely stay the same — that is the point of an ORM.

## Practice ideas

1. Draw the ER diagram from memory, then compare to `schema.prisma`.
2. Delete a person in Prisma Studio and confirm tasks keep existing with `assigneeId = null`.
3. Try inserting a task with a fake `projectId` via Studio/SQL and observe the foreign key failure.
