# Common React (and related) Functions

This note explains the functions you see most often in the Task Board UI — what each one does, when to use it, and where it appears in this repo.

Related reading: [03-react-frontend.md](./03-react-frontend.md) (how screens are structured).

---

## Mental model first

React components are functions that return UI. When something changes (state, props, parent re-render), React runs the function again and updates the DOM.

| Kind | Examples | Job |
| --- | --- | --- |
| **Hooks** | `useState`, `useEffect`, `useTransition` | Let a component remember things or run side effects |
| **Navigation** | `Link` (Next.js) | Move between pages without a full browser reload |
| **Async JS** | `await`, `async`, `Promise` | Wait for slow work (network, DB) without freezing the whole program |
| **Browser APIs** | `fetch` | Talk to your backend over HTTP |

Hooks must be called at the **top level** of a client component (not inside loops/ifs), and only in files that start with `"use client"` (or that are imported by one).

---

## `useState` — remember a value that can change

### What it does

`useState` stores a piece of data that belongs to this component. When you update it, React re-renders the component so the UI can show the new value.

```ts
const [projects, setProjects] = useState<Project[]>([]);
```

- `projects` — current value (read it in JSX)
- `setProjects` — function to change the value
- `[]` — initial value on first render

### Why you need it

Without state, variables reset every render and the UI cannot react to user input or API results.

### In this app

| State | File | Purpose |
| --- | --- | --- |
| `projects` / `people` / `project` | list & board pages | Data loaded from the API |
| `loading` / `error` | same | Empty / loading / error UX |
| `name`, `title`, `email` | forms | Controlled inputs (`value` + `onChange`) |
| `open` / `createOpen` | dialogs | Whether a modal is visible |

Example from `projects-page.tsx`:

```ts
const [name, setName] = useState("");

<Input
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

Typing updates `name` → React re-renders → the input shows what you typed.

### Tips

- Prefer one state variable per concern (data, loading, form draft).
- To update based on the previous value, use a function: `setProjects((current) => [newItem, ...current])`.
- State is **not** the database — refresh the page and only API-saved data comes back.

---

## `useEffect` — run code after render (side effects)

### What it does

`useEffect` schedules work that is **not** just “compute UI,” such as:

- Fetching from an API when the page loads
- Subscribing to events
- Syncing with something outside React

```ts
useEffect(() => {
  void loadProjects();
}, []);
```

- The function inside runs **after** the browser paints.
- The second argument is the **dependency array**.

### Dependency array

| Array | Meaning |
| --- | --- |
| `[]` | Run once after the first mount (typical “load data on open”) |
| `[projectId]` | Re-run when `projectId` changes |
| omitted | Run after every render (usually a bug — avoid) |

### In this app

On Projects, People, and the Board:

```ts
useEffect(() => {
  void loadProjects(); // or loadPeople() / load()
}, []);
```

That is how the list fills in after “Loading…” without you clicking anything.

On the board, load is wrapped in `useCallback` and the effect depends on `[load]` so it stays in sync when `projectId` changes:

```ts
const load = useCallback(async () => { /* fetch project + people */ }, [projectId]);

useEffect(() => {
  void load();
}, [load]);
```

### Tips

- Do not `await` at the top of a component body for client fetch — put async work inside `useEffect` (or event handlers).
- If you add listeners or timers, return a cleanup function from the effect.
- Fetching in `useEffect` is intentional here for learning; Server Components can also load data on the server.

---

## `useTransition` — mark updates as non-urgent

### What it does

```ts
const [pending, startTransition] = useTransition();
```

- `startTransition(fn)` — run state updates inside `fn` as a **transition** (lower priority than typing into an input).
- `pending` — `true` while that transition is in progress (great for “Saving…” buttons).

### Why use it here

Form submits and task moves call the API, then update lists. Wrapping that work in `startTransition` keeps the UI responsive and gives you a built-in busy flag:

```ts
startTransition(async () => {
  const res = await fetch("/api/projects", { method: "POST", /* ... */ });
  const data = await res.json();
  setProjects((current) => [data, ...current]);
});

<Button disabled={pending}>{pending ? "Creating…" : "Create project"}</Button>
```

### Tips

- Use transitions for **updates that can wait a bit** (lists refreshing after save), not for every keystroke.
- `pending` becomes false when React finishes the transition work; still handle API errors yourself.

---

## `useCallback` — stable function identity

### What it does

```ts
const load = useCallback(async () => {
  // ...
}, [projectId]);
```

Returns a memoized function that only changes when its dependencies change.

### Why it appears on the board

`useEffect` depends on `load`. Without `useCallback`, a new `load` function would be created every render → the effect would re-run forever. With `useCallback` + `[projectId]`, `load` (and the effect) only refresh when the project id changes.

### Tips

- You do not need `useCallback` on every function — use it when a stable reference matters (effect deps, child memoization).
- This project mostly avoids heavy memoization; the board is the intentional example.

---

## `Link` (Next.js) — client-side navigation

### What it does

```tsx
import Link from "next/link";

<Link href="/people">People</Link>
```

Renders an `<a>` that Next.js intercepts so navigation stays inside the app: faster, keeps client state where possible, and prefetches linked routes in the background.

### vs a plain `<a href>`

| | `Link` | `<a href>` |
| --- | --- | --- |
| Full page reload | No (usually) | Yes |
| Prefetch | Yes (App Router) | No |
| Use for | In-app routes | External sites, downloads |

### In this app

- Header: Projects / People
- Project cards: `/projects/[id]`
- Board: “All projects” back link

```tsx
<Link href={`/projects/${project.id}`}>{project.name}</Link>
```

---

## `await` / `async` — wait for promises

### What it does

JavaScript is single-threaded. Slow work (network, disk) returns a **Promise**. `async` functions can `await` that promise: pause this function until the result is ready, without blocking the whole browser.

```ts
async function loadProjects() {
  const res = await fetch("/api/projects");
  const data = await res.json();
  setProjects(data);
}
```

Order of events:

1. `fetch` starts the HTTP request (returns a Promise).
2. `await` waits until the response arrives.
3. `res.json()` parses the body (another Promise).
4. Then you call `setProjects`.

### Where `await` shows up in this stack

| Place | Example |
| --- | --- |
| Client components | `await fetch(...)`, `await res.json()` |
| Route Handlers | `await request.json()`, `await prisma.project.findMany()` |
| Server pages | `const { id } = await params` in `projects/[id]/page.tsx` |

### Tips

- Only use `await` inside `async` functions (or at the top level of an ES module in some environments).
- Always handle failures with `try/catch` around awaited API calls (as the pages do).
- `void loadProjects()` in `useEffect` means “start this async function; I am not awaiting it here.”

---

## `fetch` — call your backend

### What it does

Browser (and Node) API to make HTTP requests.

```ts
const res = await fetch("/api/tasks", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title, projectId }),
});
```

| Part | Meaning |
| --- | --- |
| URL | Which API route (`/api/projects`, …) |
| `method` | `GET` read, `POST` create, `PATCH` update, `DELETE` remove |
| `headers` / `body` | JSON payload for writes |
| `res.ok` | Was the status in the 200s? |
| `res.json()` | Parse response body |

Same-origin `/api/...` calls need no CORS setup in this Next.js app.

---

## Event handlers — respond to the user

Not hooks, but central to React:

```tsx
<button onClick={() => openEdit(task)}>…</button>
<form onSubmit={handleCreate}>…</form>
<input onChange={(e) => setName(e.target.value)} />
```

| Prop | When it fires |
| --- | --- |
| `onClick` | Click / tap |
| `onChange` | Input value changes |
| `onSubmit` | Form submit (call `event.preventDefault()` to avoid full page reload) |

Handlers often call `setState` and/or `startTransition` + `fetch`.

---

## Conditional rendering — UI from state

```tsx
{loading ? <p>Loading…</p> : null}
{error ? <p>{error}</p> : null}
{projects.length === 0 ? <EmptyState /> : <ProjectList />}
```

React re-renders when state changes; these expressions pick what to show. That is how loading / empty / error / success screens work on Projects and People.

---

## Quick cheat sheet

| Function | One-line meaning | In Task Board |
| --- | --- | --- |
| `useState` | Store UI data that can change | Lists, forms, dialogs |
| `useEffect` | Run side effects after render | Load data on mount |
| `useTransition` | Non-urgent updates + `pending` | Create / save / move |
| `useCallback` | Keep a function stable | Board `load` + effect |
| `Link` | In-app navigation | Header, cards, back link |
| `await` | Wait for a Promise | `fetch`, Prisma, `params` |
| `fetch` | HTTP to `/api/...` | All CRUD from the UI |
| `onClick` / `onSubmit` | Handle user actions | Buttons and forms |

---

## Practice ideas

1. Add a `useState` counter on the Projects page and a button that increments it — see re-renders without touching the API.
2. Change the People `useEffect` dependency array incorrectly and watch the Network tab (or an infinite loop).
3. Remove `disabled={pending}` and notice you can double-submit; put it back.
4. Replace one `Link` with `<a href=...>` and feel the full reload.
5. Trace one `await fetch` in DevTools → Network while clicking “Add task.”
