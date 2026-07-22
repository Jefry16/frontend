# Components — Architecture, Rules & Inventory

How we build, name, place, and catalog components. This is prescriptive: new UI
**must** follow it. It is the frontend analogue of the backend's constitution.

Pairs with [`STACK.md`](./STACK.md) (package docs) and the boundary rules in
`.dependency-cruiser.cjs` (which mechanically enforce §2).

---

## 1. The two governing rules

**R1 — `components/ui/` is vendored shadcn. Never hand-edit a primitive.**
A primitive (`button`, `input`, `field`, `dialog`, …) is consumed by many components;
editing a `ui/` file to suit one screen silently changes every other consumer. Manage
primitives **only** through the shadcn CLI (`pnpm dlx shadcn@latest add <name>`). To vary
a primitive, **wrap it** in an `App*` component and put the variation there (props,
`cn(...)` classes, or `cva` variants at the wrapper). If a primitive lacks a capability,
add it at the `App*` layer — never by mutating `ui/`. (Biome does not lint `components/ui/`
for this reason — see `biome.json` `includes`; the files stay byte-identical to shadcn.)
- **`components.json` is the source of truth** for shadcn aliases/style — don't edit it.
- **Don't move the primitives** out of `components/ui/`. The CLI also owns `lib/utils.ts`
  (the `cn` helper) and, when present, `hooks/use-mobile.ts` — treat those as CLI-managed too.

**R2 — Componentize: a name and a home for (almost) everything.**
Prefer a named component over inline or repeated markup. If a JSX block appears more than
once, or has a single nameable responsibility, extract it — to the module
(`<module>/components/AppX.tsx`) when domain-specific, to `shared/` when cross-cutting.
**Guardrail:** extract from *real* duplication or a *real* responsibility — **on the
second real use, not the first imagined one.** No props/branches/config for cases that
don't exist yet. One clear component beats one clever generic one.

---

## 2. Layers & dependency direction

Four layers, one-way imports, **enforced by `pnpm depcheck`**. Never import upward.

```
routes/            file-based pages (thin — wiring only, no design decisions)
  └─→ <module>/    business domains (auth, tour-operator, experiences, …)
        └─→ shared/      the App* design layer + cross-cutting hooks/lib/theme
              └─→ components/ui/   shadcn primitives (CLI-managed)
```

- **`components/ui/`** — shadcn primitives (radix-nova style). CLI-managed, **never**
  imports a business module, never hand-edited (R1).
- **`shared/`** — the cross-cutting `App*` layer over shadcn + `theme.tsx`, shared hooks,
  lib helpers. Importable anywhere; **must not import any module**.
- **`<module>/`** — one folder per business domain (screaming layout — no `features/`
  wrapper). Owns its components, hooks, validators, types. Exposes a **barrel `index.ts`**;
  cross-module imports go through the barrel (`#/<module>`), never a deep path.
- **`routes/`** — TanStack file-based pages. **Thin**: read params, compose `App*`/module
  pieces. No non-trivial fetching or styling decisions.

**Alias:** import via `#/*` → `src/*` everywhere. (`@/*` is a legacy shadcn-only alias.)

**Import rules:**
- **Cross-module** and any importer outside a module (`routes/`, `lib/`, `hooks/`) reach a
  module **only through its barrel** — `#/<module>`, never `#/<module>/components/Foo`.
- **Intra-module** imports are **relative** (`./`, `../`). The barrel imports the internals,
  so an internal importing the barrel would be circular — don't.
- **`shared/` is importable from anywhere** but must not import any module.
- **No barrels for `shared/components/`** (or its subfolders). `index.ts` barrels are a
  **module-level** convention only; `shared/` is not a module.

### Canonical module shape (use only the parts you need)

```
<module>/
├── components/     App*Form.tsx and other module-only UI (+ .stories.tsx)
├── hooks/          use-x-form.ts (create/update), use-x.ts (queries)
├── validators/     x.ts zod schema (+ x.test.ts)
├── types.ts        hand-written response types (match the backend contract)
└── index.ts        public barrel
```

Add each new module's folder name to `MODULES` in `.dependency-cruiser.cjs` or its
boundaries go unenforced.

---

## 3. Naming

- **`App*` prefix for every design-layer / feature component** (`AppLoginForm`,
  `AppField`, `AppAuthFormWrapper`, and future `AppDataTable`, `AppPageHeader`, …).
  Greppable, and visually distinct from primitives.
- **Primitives keep their lowercase shadcn names** in `components/ui/` (`button`, `field`).
- **Hooks:** `use-*` (`use-login-form`, `use-app-toast`). **Providers:** `*Provider`
  (`AuthProvider`, `ThemeProvider`).

---

## 4. Styling — tokens only

Tailwind v4 (CSS-first, no config file) + shadcn CSS variables in `src/styles.css`
(`oklch` under `:root`/`.dark`, mapped via `@theme inline`). **Reference semantic tokens;
never hardcode a color.** Use `bg-background`, `text-foreground`, `text-muted-foreground`,
`bg-primary`, `border`, `bg-destructive`, `--success`/`--warning`/`--info`. No hex, no
`bg-emerald-500`, no `bg-[#…]` in app code. Compose classes only through `cn(...)`
(`#/lib/utils`). Swapping the palette later is then a one-file edit.

**More styling rules:**
- **Monochrome-placeholder palette — "premium through structure, not color."** The palette
  is deliberately chroma-0 greys + a few semantic accents (`--destructive`, `--success`,
  `--warning`, `--info`). Don't introduce brand/decorative color; lean on layout, spacing,
  weight, and hierarchy. Real brand colors drop in later by editing only the token values in
  `:root`/`.dark` — which stays a one-file change *because* nothing hardcodes a color.
- **Radius from the derived scale.** `--radius-sm … --radius-4xl` are `calc(--radius × n)`.
  Use the scale (`rounded-md`, `rounded-lg`, …); don't invent radii.
- **Spacing from Tailwind's scale — no magic pixel values.** Use `gap-*`/`p-*`/`m-*`
  (and layout via flex/grid `gap`), not arbitrary `p-[13px]`.

---

## 5. Forms (the current pattern)

Built on the **base `@tanstack/react-form` `useForm`** + `zod` validators + shadcn
`Field`/`Input`, composed as:

- `AppField` — one field: shadcn `Field` + `Input` bound to a TanStack Form field, errors
  below. (Auth-local today; promote to `shared/` on the second feature that needs a form.)
- `AppAuthFormWrapper` — the auth-page shell (logo, card, inline error banner, submit).
- `use-<x>-form.ts` — the hook: `useForm` + a `useMutation`, mapping server errors to an
  inline `errorMessage` and navigating on success.
- `validators/<x>.ts` — a zod schema that **mirrors the backend value objects** (so a bad
  field fails client-side with a precise message instead of an opaque 422).

> The archive's richer app-wide form framework (`AppFormWrapper` + a typed-input factory)
> is **deferred** — reintroduce it (in `shared/`) only when a feature needs its breadth
> (R2). Until then, forms compose `AppField` directly.

---

## 6. Storybook is the living inventory

**Every `App*` component ships a colocated `.stories.tsx`.** Storybook is the browsable
catalog and the design-review surface; primitives (`components/ui/`) are exempt (they're
upstream shadcn). Run `pnpm storybook`; build with `pnpm build-storybook`.

- Framework: `@storybook/tanstack-react` — auto-provides a memory-backed Router, so
  route-aware components render without the app shell.
- Global providers (theme, React Query, tooltips) come from `.storybook/preview.tsx`.
- **Connected components** (read `useAuth`, etc.) add the needed provider as a story-level
  `decorators` entry (see `AppLoginForm.stories.tsx`).
- Cover the meaningful states (default, error, loading/submitting), not every prop combo.

A ratchet enforcing story-per-`App*` is a planned follow-up (the archive shipped one).

---

## 7. How to add a component (recipe)

1. **Need a primitive?** `pnpm dlx shadcn@latest add <name>` → lands in `components/ui/`.
   Never hand-edit it (R1).
2. **Building feature/shared UI?** Create `App<Name>.tsx` in the module's `components/`
   (domain-specific) or `shared/` (cross-cutting). Compose primitives + tokens.
3. **Write its `.stories.tsx`** alongside it (§6) — this is the inventory entry.
4. **Wire it** from a thin route or a parent component. Cross-module use goes through the
   barrel (`#/<module>`).
5. **Gate it:** `pnpm typecheck && pnpm depcheck && pnpm test` (and `pnpm check` for lint).

---

## 8. Current inventory

### `components/ui/` — shadcn primitives (radix-nova), 18 — vendored, no stories

`alert` · `avatar` · `badge` · `button` · `card` · `dialog` · `dropdown-menu` · `field` ·
`input` · `label` · `select` · `separator` · `skeleton` · `sonner` · `spinner` · `table` ·
`textarea` · `tooltip`

### `App*` components — 4 (all in `auth/`, each with a story)

| Component | Location | Role | Story |
|---|---|---|---|
| `AppField` | `auth/components/` | one form field (Field + Input + errors) | ✅ |
| `AppAuthFormWrapper` | `auth/components/` | auth-page shell (logo, card, error, submit) | ✅ |
| `AppLoginForm` | `auth/components/` | the login form | ✅ |
| `AppRegisterForm` | `auth/components/` | the register form | ✅ |

### Providers — 2

`AuthProvider` (`auth/`) · `ThemeProvider` (`shared/theme.tsx`)

### Route / page components — 6 (thin, in `routes/`)

`RootDocument` (shell) · `AppLayout` (auth gate) · `Home` (authenticated landing) ·
`AuthLayout` · `LoginPage` · `RegisterPage`

### Not yet built — build to the shape above when a feature needs them

`AppPageHeader` · `AppBreadcrumb` · `AppDataTable` (+ `useDataTable`) · `AppResourceDetail`
· `AppSaveBar` · `AppStatusBadge` · `AppEmptyState` · `AppConfirmDialog` · `AppModal` ·
`AppAlert` · the shared form framework. (These existed in the archive; re-earn each on
first real use, don't port speculatively.)

> **Deferred conventions — consult the archive when you build the slice.** The detailed
> shapes for forms (full-width `AppFormWrapper` + typed-input factory + 2-col grid, *never
> hand-roll `<input>`+`<label>`*), data/cache (hierarchical query-keys, `notFoundAwareRetry`
> on by-id queries, the create/update/delete/publish invalidation convention,
> `onError = toast.error(apiErrorMessage(err))`, branch on `code` never `message`),
> instants/money (operator-timezone formatters, minor-units), and the list/detail page
> vocabularies live in the archive's `ARCHITECTURE.md` (`/home/jefrycayo/archive-vointika/frontend`).
> Re-earn them into `shared/` per R2 when the feature that needs them lands.

### The operator app shell grows with features

The operator shell (`tour-operator/components/AppTourOperatorSidebar.tsx` + the
`$tourOperatorId` layout route) is intentionally minimal and **converges to the archive as
features land** — don't build shell chrome ahead of the pages it points at. When a feature
slice adds an operator page, it also:

1. adds its **nav leaf** to `tour-operator/nav-items.ts` (icon + `to`/`params`);
2. later adds its **settings section** (when the settings space exists) and its **⌘K
   command-palette destination** (when the palette exists).

Deferred shell subsystems, each re-earned from the archive's `tour-operator/` with its
feature: grouped/collapsible nav · `usePermissions` role-gating (hide-don't-disable) · the
⌘K command palette · the second "settings space" sidebar + `settings-sections` catalog + hub
· footer `AppLanguagePicker` (needs the ui-languages feature) · per-page `AppBreadcrumb`
(joins `AppPageHeader` on the first nested page). Like the archive, there is **no desktop top
bar** — the sidebar is always visible (toggle via its rail or Ctrl/Cmd+B); a mobile-only strip
holds the `SidebarTrigger`. We do keep a footer **sign-out** (the archive shell never surfaces
it). Pages open with `AppPageHeader` and use the `mx-auto w-full max-w-*` centered container.
