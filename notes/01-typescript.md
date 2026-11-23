# TypeScript — Shared Language Across the Stack

## Role

TypeScript is JavaScript with **static types**. In this project it is the single language for:

- React components (`.tsx`)
- API route handlers (`.ts`)
- Prisma seed scripts
- Shared helpers (`src/lib/`)

That means the shape of a `Task` or `Project` can be discussed the same way in the UI and on the server.

## Why it matters for learning full stack

Without types, frontend and backend often drift apart (“API returns `assigneeId`, UI expects `assignee_id`”). TypeScript does not automatically sync the API contract, but it makes mistakes visible early:

- Wrong property names fail at compile time in the editor.
- Enums-like unions (`"todo" | "in_progress" | "done"`) document valid values in code.

## Where types live in this repo

| File | Purpose |
| --- | --- |
| `src/lib/types.ts` | Client-facing shapes for Project, Task, Person |
| `src/lib/constants.ts` | Status/priority unions + type guards |
| Generated `@prisma/client` | Types from the database schema |

Example from `src/lib/constants.ts`:

```ts
export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && TASK_STATUSES.includes(value as TaskStatus);
}
```

The API uses `isTaskStatus` when validating JSON bodies. The UI uses `TaskStatus` for select dropdowns. Same vocabulary, both sides.

## Client vs server types

- **Prisma types** (from `@prisma/client`) are ideal on the server after a DB query.
- **`src/lib/types.ts`** is a simpler JSON-oriented view for the browser after `fetch` (dates often arrive as strings).

That split is normal: the database model and the HTTP payload are related but not identical.

## What TypeScript is *not*

- It is not a database.
- It does not replace runtime validation. Users can still POST bad JSON; the API must check values at runtime (see `isTaskStatus`).
- It does not run in the browser as TypeScript — Next.js compiles it to JavaScript.

## Practice ideas

1. Add a new priority `"urgent"` in `TASK_PRIORITIES` and follow the TypeScript errors until the UI and API agree.
2. Change a field name in `types.ts` and watch which components break — that shows your dependency graph.
