# Vointika Admin — Frontend

The operator-facing admin SPA. A **fresh rebuild**, built **feature module by feature module**, in the same
order the backend shipped its contexts, keeping only what a shipped feature needs.

Cross-repo law and state live one level up, in their own git repo:
`/home/jefrycayo/vointika/CONSTITUTION.md` (LAW) and `MAP.md` (the living
architecture). LAW arrives automatically; **load MAP yourself**.

In this repo: this file is the *context and local calibration*, `docs/COMPONENTS.md`
the *recipes*, `docs/STACK.md` the *versions and their gotchas*, `docs/TESTING.md`
*what earns a test and how we know it works*.

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
>
> **What earns a test lives in [`docs/TESTING.md`](./docs/TESTING.md)** — the rule
> (*write a test when the gate can't see it and the screen won't show it*), the tiers,
> and the reason a test is not real until you have watched it fail against broken source.
> Coverage is a map, never a score; nothing gates on it.

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
  no SSR server) + **TanStack Router** (file-based routing).
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
pnpm test:ui             # browsable run report (watch)
pnpm test:coverage       # coverage/index.html — a map, not a score
pnpm smoke               # real browser vs real backend — run after a contract change
```

The backend must be running on `:8080` (see `VITE_API_URL` in `.env`).

## Structure

```
src/
  routes/            file-based routes (TanStack Router discovers these). __root.tsx = shell.
  components/ui/     shadcn primitives — must not import feature modules.
  shared/            the App* design layer (page frame, table, form fields, states) + theme.tsx.
                     No feature-module imports. See docs/COMPONENTS.md §8.
  lib/               framework-agnostic helpers: api client, tokens, query helpers, cn().
  hooks/             app-wide hooks (use-app-toast, use-resource, use-all-pages, use-mobile).
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
  Use `apiErrorMessage()` for the human string, and **never branch on `message`** — it is
  prose and it changes. A specific cause branches on the HTTP status, which is what all
  sixteen sites that need one do (`error.response?.status === 409` → "that handle is
  taken"). `code` is on the wire but nothing reads it, so there is no helper and the type
  in `lib/api-error.ts` omits it; add both together the first time a cause needs it.
  **Where it surfaces follows the hook's kind; whether it's specific follows the failure.**
  A `use-*-form.ts` hook puts `apiErrorMessage(err)` into the form's inline `AppAlert`, so
  the reason sits beside the field that caused it. A `use-*-actions.ts` hook toasts, and
  picks by what the action can fail on: the generic `toast.error(m.error())` when there is
  nothing the operator could act on, `toast.error(apiErrorMessage(error))` when the backend
  answers with a business rule they can fix. Five do the latter today — `use-slot-actions`
  (*"Capacity cannot be below the seats already booked"*), `use-page-actions`,
  `use-menu-actions`, `use-metaobject-actions`, `use-metaobject-definition-actions` — all
  publish/rename/capacity paths that 409 or 422 with a reason. The other eight are deletes
  and state flips that either work or fail for reasons a toast can't help with.
  Two more deviate for their own stated reasons, and neither is a bug to "fix":
  `use-forgot-password-form` stays generic on purpose (anti-enumeration — the endpoint 204s
  whether or not the address exists), and `use-metafield-value-save` applies
  `apiErrorMessage` inside its loop so the toast can name the field that failed.
- **Query retry:** the app's `QueryClient` (`router.tsx`) defaults every query to
  `notFoundAwareRetry` (`lib/query-retry.ts`) — the library's 3-attempt backoff for
  transient failures, but **zero retries on a 404**, since a missing (or cross-tenant)
  record never becomes present. Without it every by-id detail page sat ~7s on a skeleton
  before `AppResourceView` could paint `AppNotFound`.
- **API identity (backend house rule):** responses use `id` (never a prefixed `userId`) and
  a `context` discriminator (the entity's collection, e.g. `"users"`) — never `type`.
- **i18n:** user-facing strings come from `#/paraglide/messages` (`import * as m`), keyed in
  `messages/en.json`. Add a locale by adding it to `project.inlang/settings.json` + a
  `messages/<locale>.json` catalog. Distinguish **admin-UI language** (this) from
  **content language** (operator's storefront locales — a backend concept).
- **Every `App*` component ships a story**, and `src/shared/story-coverage.test.ts` fails
  the build if one does not. Its allow-list is empty; add to `EXEMPT` only for something
  that genuinely cannot be storied, with a reason. That gate checks a file **exists** —
  `src/shared/story-render.test.tsx` is what checks it **works**, mounting all 274 stories
  through `composeStories` with the real decorators. Global providers, auth included, live
  in `.storybook/preview.tsx`; a story needing more adds its own decorator.
- **Styling is gated.** `src/shared/token-drift.test.ts` fails on a raw palette class
  (`bg-blue-500`, `bg-white`) or an arbitrary value (`w-[347px]`) anywhere in `src/`
  outside vendored `components/ui/`. Its allow-list is **empty and only shrinks**.
  Variant selectors (`data-[state=open]:`), `var(--…)` references and grid track lists
  are allowed by design — they are conditions and references, not ad-hoc values.
- **Styling:** use the design tokens (`bg-background`, `text-foreground`, `border-border`,
  `--success`/`--warning`/`--info` semantic colors). Both light and dark themes are defined
  in `styles.css`; the FOUC guard in `__root.tsx` applies the resolved theme pre-paint.
- **Tests** fail on any unhandled request (`onUnhandledRequest: "error"`); register MSW
  handlers in `src/test/handlers.ts`. Render with `renderWithProviders` from `test/test-utils`.

## CI

`.github/workflows/ci.yml` runs the full gate set — typecheck · check · depcheck ·
tests · build · build-storybook — on every push and PR to `staging`. **There is no
deploy step**: the hosting target is undecided. `build:staging` / `build:production`
still produce the mode-specific bundles, so whatever host is chosen has something to
upload; `storybook-static/` is built and discarded, since nothing hosts it either.

`build-storybook` is there because the test suite reads `.storybook/preview` but never
`main.ts`, leaving the framework and builder config ungated. It is a narrow gate: a bad
framework entry fails it, while a missing addon or a `stories` glob matching nothing
both warn and exit 0.
