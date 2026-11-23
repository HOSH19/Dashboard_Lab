# Tailwind CSS & shadcn/ui — Styling Layer

## Role

This layer makes the app look and feel usable without writing large custom CSS files.

- **Tailwind CSS** — utility classes in JSX (`className="flex gap-4 ..."`)
- **shadcn/ui** — copy-paste React components built on Radix primitives + Tailwind

Together they are the **presentation system**, not business logic.

## Tailwind in this project

Entry file: `src/app/globals.css`

- Imports Tailwind and shadcn theme tokens
- Defines CSS variables (`--background`, `--primary`, …)
- Layout uses those tokens so colors stay consistent

Example patterns you will see:

| Class pattern | Intent |
| --- | --- |
| `flex`, `grid`, `gap-*` | Layout |
| `text-muted-foreground` | Secondary text |
| `rounded-xl border border-border` | Surfaces without heavy “card” chrome |
| `sm:` / `lg:` prefixes | Responsive breakpoints |

You style by composing small classes next to the markup that needs them. That keeps UI changes local to the component.

## shadcn/ui primitives used

Files under `src/components/ui/`:

| Component | Used for |
| --- | --- |
| `button` | Primary actions, outline moves, destructive delete |
| `input` / `textarea` | Form fields |
| `label` | Accessible field labels |
| `dialog` | Create/edit modals |
| `select` | Status, priority, assignee |
| `badge` | Priority chip on task cards |

These are **real source files in your repo** (not a black-box npm UI kit). You can open `button.tsx` and change variants.

Helpers:

- `src/lib/utils.ts` — `cn()` merges class names
- `components.json` — shadcn project config (aliases, style)

## Separation of concerns

```text
React component logic  →  what data and events mean
Tailwind / shadcn      →  how it looks and how controls behave visually
```

A status move still works if styles break; a beautiful button that never calls `fetch` does nothing durable.

## Design choices in the Task Board UI

- Neutral slate background gradient in `layout.tsx` for light atmosphere
- Board columns as bordered sections, not nested marketing cards
- Empty / loading / error states use dashed borders and clear copy

## Practice ideas

1. Change the primary button color via CSS variables in `globals.css`.
2. Add a shadcn component (`npx shadcn@latest add alert`) and show API errors with it.
3. Make the board stack to one column on small screens (already partly handled with `lg:grid-cols-3`).
