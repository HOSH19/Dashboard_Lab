# Tooling & Scripts — How You Run the Stack

## Role

Tooling is the glue that makes development repeatable: install dependencies, generate clients, migrate the database, start the server, and seed sample data.

You do not need to memorize every flag — learn **which tool owns which job**.

## Package manager (npm)

`package.json` declares:

- **dependencies** — needed to run the app (`next`, `react`, `@prisma/client`, …)
- **devDependencies** — needed to build/develop (`typescript`, `prisma` CLI, `tsx`, …)
- **scripts** — named commands for humans and CI

```bash
npm install          # install from package-lock.json
npm run dev          # start Next on port 43127
npm run build        # prisma generate + next build
npm run db:migrate   # prisma migrate dev
npm run db:seed      # tsx prisma/seed.ts
npm run db:reset     # wipe DB, migrate, seed
```

`postinstall` runs `prisma generate` so the client exists after install.

## Environment variables

| File | Purpose |
| --- | --- |
| `.env.example` | Safe template committed to git |
| `.env` | Local secrets/config (gitignored) |

For this app the important value is `DATABASE_URL`. There are no third-party API keys required.

## TypeScript compiler / Next bundler

You rarely run `tsc` directly. `next dev` and `next build` typecheck and bundle. If types fail, the build stops — treat that as a feature.

## Prisma CLI

| Command | Job |
| --- | --- |
| `prisma migrate dev` | Create/apply migrations in development |
| `prisma generate` | Rebuild typed client from schema |
| `prisma studio` | Visual table browser |
| `prisma migrate reset` | Destructive reset + seed |

Config: `prisma.config.ts` (schema path, migrations path, seed command).

## tsx

`tsx` runs TypeScript files directly (used for `prisma/seed.ts`) without a separate compile step.

## ESLint

`npm run lint` / `eslint` catches common React/Next issues. It is not a substitute for tests, but it keeps the learning codebase tidy.

## Git hygiene for this stack

Ignored on purpose (see `.gitignore`):

- `node_modules/`
- `.next/`
- `.env`
- `*.db` SQLite files

Committed on purpose:

- source code
- `prisma/schema.prisma` + migrations
- `notes/`
- `.env.example`

## Mental model

```text
npm / node     → run JavaScript tooling
Next.js        → app server + bundler
Prisma CLI     → schema & database evolution
SQLite file    → data at rest
Browser        → exercise the running system
```

## Practice ideas

1. Delete `prisma/dev.db`, run `npx prisma migrate dev`, then `npm run db:seed`, and confirm the UI fills again.
2. Change the dev port in `package.json` and update these notes.
3. Run `npm run build` and skim the route table Next prints — match each route to a file under `src/app`.
