# Vointika Admin — Frontend

The operator-facing admin SPA. A **fresh rebuild**, built **feature module by feature module**, in the same
order the backend shipped its contexts, keeping only what a shipped feature needs.

Cross-repo law and state live one level up, in their own git repo:
`/home/jefrycayo/vointika/CONSTITUTION.md` (LAW) and `MAP.md` (the living
architecture). LAW arrives automatically; **load MAP yourself**.

In this repo: this file is the *context and local calibration*, `docs/COMPONENTS.md`
the *recipes*, `docs/STACK.md` the *versions and their gotchas*.

The foundation phase is over — which feature modules exist is answered by `MODULES` in
`.dependency-cruiser.cjs`, and that list is the source of truth, because a module missing
from it has no enforced boundaries.

> **Authoritative package docs live in [`docs/STACK.md`](./docs/STACK.md)** — every
> dependency with its pinned version, purpose, and the canonical documentation URL.
> Consult it before reaching for an API; verify against those docs rather than assume
> (e.g. Zod v4, Tailwind v4, TanStack Start SPA mode, Paraglide v2).
>
> **Component rules + inventory live in [`docs/COMPONENTS.md`](./docs/COMPONENTS.md)** —
> the layered architecture, R1 (ui/ is vendored shadcn, never hand-edit) / R2
> (componentize on the 2nd real use), `App*` naming, styling rules, the forms pattern, and
> the rule that **every `App*` component ships a `.stories.tsx`** (Storybook is the living inventory).

## Gates

`pnpm typecheck` · `pnpm test` · `pnpm depcheck` · `pnpm check` · `pnpm build` — all green
before a commit. Run `pnpm paraglide:compile` first: `src/paraglide/` is generated and
gitignored, so typecheck and test fail without it.

## Working rules

The working rules are LAW: §2.4 never over-engineer · §3 the landing ritual · §4 never
assume · §6 craft (comments, commits, dead code, staying in scope). Only the calibration
for this repo lives here.

- **Boundaries and formatting are caught at the gate.** `pnpm depcheck`
  (dependency-cruiser) enforces the module rules below and Biome enforces lint/format, so
  LAW §6.3's mechanical half is automatic — except for a new module, which is unenforced
  until its folder name is in `MODULES`. The list *is* the enforcement.
- **`docs/COMPONENTS.md` is this repo's PATTERNS** — check it for a matching recipe before
  building (LAW §5.2), and mirror surrounding code rather than introducing a second way.

## Stack

- **React 19** + **TanStack Start** (SPA mode — static prerendered shell + client bundle,
  hosted on Cloudflare Pages; no SSR server) + **TanStack Router** (file-based routing).
- **TanStack Query** for server state. **Vite 7** build.
- **Tailwind CSS 4** (`@tailwindcss/vite`) + **shadcn/ui** primitives (`components/ui/`,
  style `radix-nova`, `radix-ui` + `lucide-react`). Design tokens live in `src/styles.css`.
- **Biome** (lint + format, tabs, double quotes) + **dependency-cruiser** (module boundaries).
- **inlang / paraglide** for i18n (messages in `messages/<locale>.json`, compiled to
  `src/paraglide/`). **Vitest** + **Testing Library** + **MSW** for tests.
- **axios** for HTTP.

## Commands

```bash
pnpm install
pnpm paraglide:compile   # generate src/paraglide/ (gitignored) — run before typecheck/test
pnpm dev                 # vite dev on :3000
pnpm typecheck           # tsc --noEmit
pnpm check               # biome (lint + format)
pnpm depcheck            # dependency-cruiser boundary rules
pnpm test                # vitest run
```

The backend must be running on `:8080` (see `VITE_API_URL` in `.env`).

## Structure

```
src/
  routes/            file-based routes (TanStack Router discovers these). __root.tsx = shell.
  components/ui/     shadcn primitives — must not import feature modules.
  shared/            cross-feature building blocks (theme.tsx today). No feature-module imports.
  lib/               framework-agnostic helpers: api client, tokens, query helpers, cn().
  hooks/             app-wide hooks (use-app-toast).
  test/              MSW server + handlers + renderWithProviders.
  paraglide/         GENERATED i18n output (gitignored) — recompile after pulling.
  <feature>/         a feature module (auth, tour-operator, experiences, …) — added one at a time.
messages/            i18n source catalogs (en.json).
```

Path alias: import via **`#/*`** (maps to `src/*`), e.g. `#/lib/api`, `#/components/ui/button`.

## Module boundaries (enforced by `pnpm depcheck`)

Each feature lives in `src/<module>/` and exposes a **barrel** `index.ts`. The rules:

1. No circular imports.
2. Cross-module imports go **through the barrel** — `#/<module>`, never `#/<module>/components/...`.
3. `routes/`, `lib/`, `hooks/` reach a module only via its barrel.
4. `shared/` and `components/ui/` must **not** import any feature module.

When you create a module, **add its folder name to `MODULES` in `.dependency-cruiser.cjs`**
or its boundaries go unenforced — silently, since `depcheck` still passes.

## Conventions

- **No browser storage for security-sensitive state.** The access token is held **in
  memory** (`lib/tokens.ts`); refresh rides an httpOnly cookie via `POST /auth/refresh`
  (`lib/api.ts` 401 → refresh → retry). The single documented exception is the `theme`
  key in `localStorage` (per-device UI preference, not sensitive).
- **API errors:** the backend returns `{ status, error, message, code?, timestamp }`.
  Use `apiErrorMessage()` for the human string and branch on `code` (never `message`) when
  a specific cause needs custom UX (`lib/api-error.ts`).
- **API identity (backend house rule):** responses use `id` (never a prefixed `userId`) and
  a `context` discriminator (the entity's collection, e.g. `"users"`) — never `type`.
- **i18n:** user-facing strings come from `#/paraglide/messages` (`import * as m`), keyed in
  `messages/en.json`. Add a locale by adding it to `project.inlang/settings.json` + a
  `messages/<locale>.json` catalog. Distinguish **admin-UI language** (this) from
  **content language** (operator's storefront locales — a backend concept).
- **Styling:** use the design tokens (`bg-background`, `text-foreground`, `border-border`,
  `--success`/`--warning`/`--info` semantic colors). Both light and dark themes are defined
  in `styles.css`; the FOUC guard in `__root.tsx` applies the resolved theme pre-paint.
- **Tests** fail on any unhandled request (`onUnhandledRequest: "error"`); register MSW
  handlers in `src/test/handlers.ts`. Render with `renderWithProviders` from `test/test-utils`.

## Deploy

CI (`.github/workflows/deploy.yml`): PRs/pushes to `staging` run typecheck · depcheck ·
tests; a green push to `staging` deploys to the `vointika-admin-staging` Cloudflare Pages
project. Production is tag-gated and disabled until the prod project exists.
