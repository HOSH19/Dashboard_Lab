# Prisma — Object-Relational Mapper

## Role

**Prisma** is the bridge between TypeScript and the relational database.

You describe models in `prisma/schema.prisma`. Prisma then:

1. Generates a typed **Prisma Client** (`@prisma/client`)
2. Creates **migrations** (SQL files that evolve the schema)
3. Lets you query with JavaScript/TypeScript instead of hand-written SQL for most CRUD

## Core files

| Path | Role |
| --- | --- |
| `prisma/schema.prisma` | Models, fields, relations |
| `prisma/migrations/` | Versioned SQL applied to the DB |
| `prisma/seed.ts` | Sample data for learning / demos |
| `prisma.config.ts` | Prisma CLI config (datasource URL, seed command) |
| `src/lib/prisma.ts` | Singleton client for the Next.js server |

## Client singleton

`src/lib/prisma.ts` caches `PrismaClient` on `globalThis` in development so hot reload does not open endless DB connections.

Always import that helper in Route Handlers:

```ts
import { prisma } from "@/lib/prisma";
```

Never instantiate a new client in every request in a long-lived Node process without care.

## Common query patterns in this app

**List with counts**

```ts
prisma.project.findMany({
  include: { _count: { select: { tasks: true } } },
});
```

**Join related rows (board view)**

```ts
prisma.project.findUnique({
  where: { id },
  include: {
    tasks: {
      include: { assignee: true },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    },
  },
});
```

`include` is how you express SQL joins in Prisma while staying typed.

**Create nested records (seed)**

```ts
prisma.project.create({
  data: {
    name: "Website Redesign",
    tasks: { create: [{ title: "Audit current pages", status: "done" }] },
  },
});
```

**Update / delete**

```ts
prisma.task.update({ where: { id }, data: { status: "done" } });
prisma.project.delete({ where: { id } }); // tasks cascade via schema
```

## Schema → client regenerate

After changing `schema.prisma`:

```bash
npx prisma migrate dev --name describe_your_change
```

That applies SQL **and** regenerates the client. `postinstall` also runs `prisma generate` so fresh `npm install`s get a client.

## What Prisma is *not*

- Not a UI framework
- Not a replacement for understanding tables/keys (see the SQLite notes)
- Not magic validation — empty strings can still be written unless your API checks them

## Practice ideas

1. Add `dueDate DateTime?` to `Task`, migrate, expose it in API + UI.
2. Replace string `status` with a Prisma `enum` and regenerate.
3. Open Prisma Studio: `npx prisma studio` and edit a row, then refresh the board.
