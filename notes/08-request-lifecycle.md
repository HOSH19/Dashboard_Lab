# Request Lifecycle — One Feature End to End

## Role of this note

The stack only clicks when you follow **one user action** through every layer. Below: **moving a task from “To do” to “In progress.”**

## Sequence

```text
User clicks "In progress" on a task card
        │
        ▼
React (project-board.tsx)
  - optimistically updates local task.status
  - fetch PATCH /api/tasks/:id  { status: "in_progress" }
        │
        ▼
Next.js Route Handler (api/tasks/[id]/route.ts)
  - await params.id
  - parse JSON body
  - isTaskStatus("in_progress") → ok
  - prisma.task.update(... include assignee)
        │
        ▼
Prisma Client
  - translates to SQL UPDATE on Task
        │
        ▼
SQLite file (dev.db)
  - row persisted
        │
        ▼
JSON response → React replaces that task in state
```

## Layer checklist

| Step | Layer | Question it answers |
| --- | --- | --- |
| Click | React | What did the user intend? |
| `fetch` | Browser HTTP | How is intent sent to the server? |
| `PATCH` handler | Next.js / Node | Is the payload valid? Which row? |
| `prisma.task.update` | Prisma | How do we express the write safely? |
| `UPDATE Task ...` | SQLite | Where does truth live after refresh? |

## Create project (second walkthrough)

1. Dialog form in `projects-page.tsx` gathers `name` + `description`.
2. `POST /api/projects` with JSON body.
3. Handler rejects empty names (`400`).
4. `prisma.project.create` inserts a row.
5. UI prepends the new project to the list from the `201` response.

Refresh the browser: the project remains because SQLite stored it — not because React remembered it.

## Failure paths teach the stack too

| Failure | Where caught | Typical signal |
| --- | --- | --- |
| Empty title | API validation | `400` + `{ error }` |
| Unknown task id | API + Prisma find | `404` |
| DB file missing / misconfigured | Prisma / server | `500`, terminal error |
| Network down | `fetch` in React | UI error state |

## Debugging tips

1. **Browser Network tab** — inspect request URL, method, status, JSON.
2. **Terminal running `npm run dev`** — server logs and Prisma errors.
3. **Prisma Studio** — confirm the row actually changed.
4. **Hard refresh** — proves durability vs local-only state.

## Practice ideas

1. Trace **Add person** the same way (UI → `POST /api/people` → unique email `409`).
2. Break the API on purpose (comment out validation) and watch bad data enter the DB — then restore validation.
3. Add `console.log` in the Route Handler and in the React success path; order the logs mentally before running.
