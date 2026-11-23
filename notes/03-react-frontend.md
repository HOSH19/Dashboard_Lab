# React Frontend — UI, State, and User Actions

## Role

React builds the interactive interface. In this app it is responsible for:

- Showing lists and boards
- Collecting form input (create project, add task, add person)
- Calling the backend with `fetch`
- Updating local state after successful responses
- Loading, empty, and error UI states

## Key screens

| Screen | Component | User jobs |
| --- | --- | --- |
| Projects | `src/components/projects-page.tsx` | List projects, create one |
| Board | `src/components/project-board.tsx` | View columns, add/edit/move/delete tasks |
| People | `src/components/people-page.tsx` | List assignees, create people |

Shared chrome lives in `src/components/site-header.tsx` (nav links).

## State pattern used here

Typical client component flow:

```text
1. Mount → useEffect → fetch("/api/...") → setState
2. User submits form → fetch POST/PATCH → update state or reload
3. Failure → setError message for the user
```

Example responsibilities on the board:

- `project` — current project + tasks from the API
- `people` — assignee dropdown options
- `loading` / `error` — UX for network reality
- Dialog local fields (`title`, `status`, …) — draft form values

React state is **temporary**. Refresh the page and anything not saved via the API is gone.

## Optimistic UI (move task)

When you click a status button on a task card, `moveTask`:

1. Updates local state immediately (task jumps column)
2. Sends `PATCH /api/tasks/:id`
3. On failure, rolls state back to the previous snapshot

That teaches a production pattern: feel fast, stay correct.

## Forms and dialogs

Create/edit flows use shadcn `Dialog` + controlled inputs (`value` + `onChange`). Submit handlers:

- `preventDefault()` so the browser does not full-page reload
- `startTransition` to mark the mutation as non-urgent UI work
- Read JSON error messages from the API (`data.error`)

## Rendering structure of a task card

Important HTML detail: **do not nest buttons**. The board uses:

- An `<article>` card shell
- A `<button>` for “open edit dialog” (title area)
- Separate `<Button>`s for status moves

Nested interactive elements cause hydration warnings and broken accessibility.

## What the frontend deliberately does *not* do

- It does not open SQLite directly.
- It does not import Prisma in client components.
- It does not “trust” the user — the API still validates.

## Practice ideas

1. Disable the network in DevTools, try creating a project, and improve the error message.
2. Add a “Refresh” button that re-calls `load()` / `loadProjects()`.
3. After creating a project, navigate to `/projects/[id]` automatically with `useRouter`.
