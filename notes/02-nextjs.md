# Next.js — App Host and Router

## Role

**Next.js** is the Node.js framework that:

1. Serves the React UI (pages)
2. Serves the HTTP API (Route Handlers)
3. Bundles and compiles TypeScript for development and production

In this project, Next.js is both the **frontend framework** and the **backend runtime**. You do not need a separate Express server to learn request/response.

## App Router layout

Everything under `src/app/` is route-driven:

```text
src/app/
  layout.tsx              → wraps every page (header, fonts, global CSS)
  page.tsx                → "/" projects list
  people/page.tsx         → "/people"
  projects/[id]/page.tsx  → "/projects/:id" board
  api/
    projects/route.ts     → GET/POST /api/projects
    projects/[id]/route.ts
    tasks/route.ts
    tasks/[id]/route.ts
    people/route.ts
```

- **Folders = URL segments**
- **`page.tsx` = UI route**
- **`route.ts` = API endpoint**
- **`[id]` = dynamic segment** (project id or task id)

## Server Components vs Client Components

By default, files in `src/app` are **Server Components** (run on the server, can be lighter for the browser).

Interactive pieces use `"use client"` at the top:

- `src/components/projects-page.tsx`
- `src/components/project-board.tsx`
- `src/components/people-page.tsx`

Those client components own `useState`, `useEffect`, form handlers, and `fetch` calls.

Pattern used here:

1. Thin `page.tsx` (server) renders a client component.
2. The client component loads data from `/api/...` after mount.

That keeps learning clear: **UI talks to HTTP APIs**, same as if the API were a separate service.

## Config worth knowing

`next.config.ts` sets:

- `cacheComponents` / `partialPrefetching` — Next 16 rendering behavior
- `allowedDevOrigins: ["127.0.0.1"]` — so `http://127.0.0.1:43127` works in dev (not only `localhost`)

Dev server port is set in `package.json`:

```bash
npm run dev   # next dev --port 43127
```

## What Next.js gives you that raw Node does not

| Concern | Next.js approach |
| --- | --- |
| Routing | File-system routes |
| SSR / bundling | Built in |
| API endpoints | `route.ts` next to pages |
| Hot reload | Turbopack in `next dev` |

## What Next.js is *not* in this project

- Not the database (Prisma + SQLite are)
- Not the CSS system itself (Tailwind is)
- Not a permanent substitute for a dedicated API service in large orgs — but it is a valid, modern way to ship full-stack TypeScript apps

## Practice ideas

1. Add `/about` by creating `src/app/about/page.tsx`.
2. Add `GET /api/health` that returns `{ ok: true }` — see how API and UI routes differ only by `route.ts` vs `page.tsx`.
