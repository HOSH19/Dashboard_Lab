# Route Handlers — Backend HTTP API (Node.js)

## Role

Route Handlers are the **backend** of this app. They:

- Accept HTTP requests (`GET`, `POST`, `PATCH`, `DELETE`)
- Validate JSON bodies
- Call Prisma to read/write the database
- Return JSON + proper status codes

They run on the **server** (Node.js via Next.js), never in the browser.

## Endpoint map

| Method | Path | Job |
| --- | --- | --- |
| `GET` | `/api/projects` | List projects (+ task counts) |
| `POST` | `/api/projects` | Create project |
| `GET` | `/api/projects/[id]` | One project + tasks + assignees |
| `DELETE` | `/api/projects/[id]` | Delete project (tasks cascade) |
| `POST` | `/api/tasks` | Create task on a project |
| `PATCH` | `/api/tasks/[id]` | Update fields / move status |
| `DELETE` | `/api/tasks/[id]` | Delete task |
| `GET` | `/api/people` | List people |
| `POST` | `/api/people` | Create person |

Files live next to the URL they implement, e.g. `src/app/api/tasks/[id]/route.ts`.

## Anatomy of a handler

```ts
export async function POST(request: Request) {
  const body = await request.json();
  // 1. validate
  // 2. prisma.create(...)
  // 3. return NextResponse.json(data, { status: 201 })
}
```

Dynamic routes receive `params` as a Promise (Next.js App Router):

```ts
type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  // ...
}
```

## Validation responsibilities

Examples implemented in this repo:

- Require non-empty `name` / `title`
- Restrict `status` to `todo | in_progress | done`
- Restrict `priority` to `low | medium | high`
- Ensure `projectId` / `assigneeId` reference real rows
- Map Prisma unique constraint errors on email to HTTP `409`

Bad input → `400` with `{ error: "..." }`.  
Missing row → `404`.  
Success create → `201`.  
Unexpected failure → `500` (and `console.error` for the developer).

## Why an API layer exists

Could Server Components query Prisma directly? Yes. This project still uses HTTP APIs so you can learn:

1. REST-ish resource design
2. Status codes and error JSON
3. How a separate frontend (mobile app, another site) could reuse the same endpoints later

## CORS note

Same-origin `fetch` from Next pages to `/api/...` needs no CORS setup. A separate frontend on another domain would.

## Practice ideas

1. Add `GET /api/tasks?projectId=...` and use it from the board.
2. Return `422` for validation errors instead of `400` and update the UI messages.
3. Log request method + path in each handler and watch the terminal while clicking the UI.
