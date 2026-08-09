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

**The gate.** `src/shared/token-drift.test.ts` — ported from the archive, where it burned
its own drift to empty — fails on any raw palette class or arbitrary value in `src/`
outside `components/ui/`. It landed with an **empty** allow-list, because the five that
had accumulated here since July were fixed first. Never add an entry; it only shrinks.

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

**Page width — pick a variant, never a class string.** `AppPageShell` is the only home of
the page rhythm; a route wraps its body in one and passes a `variant`:
  - **`list`** — full width (`gap-6 p-6`). A table owns its horizontal space.
  - **`detail`** — centered `max-w-3xl`, `gap-8`. Single-resource card stacks breathe wider.
  - **`form`** — centered `max-w-3xl`, `gap-6`. Create / edit / translations / settings forms.
  Pick by what the page holds, not where it lives (a table in the settings space is still
  a `list`). Don't hand-write the container classes — a copied string once shipped `gap-6`
  where a detail page wanted `gap-8`, which is why the variants exist.

**Loading — `Skeleton` or `Spinner`, by whether the shape is known.**
  - **`Skeleton`** for the **first paint of content whose shape you already know**: a detail
    page, a form, a list. It reserves the layout, so nothing jumps when the data lands.
    In practice this is almost always `AppResourceView`'s `loading` prop.
  - **`Spinner`** for a wait with **no shape to reserve**: a pending mutation inside a
    button (`AppFormActions` does this for you), a route-level auth gate that hasn't decided
    which page to render, an in-place append like `AppDataTable`'s next page, or a short swap
    inside chrome that is already painted (switching a locale tab, a dialog body).

  The test is layout shift, not duration: if you can draw the box, draw a skeleton.

---

## 5. Forms (the current pattern)

Built on the **base `@tanstack/react-form` `useForm`** + `zod` validators + shadcn
`Field`/`Input`. Every app form has the same skeleton — mirror it rather than inventing a
second shape:

```tsx
<Card><CardContent>
  <form onSubmit={…} className="space-y-4">
    {errorMessage && <AppAlert title={m.error()} description={errorMessage} />}
    <FieldGroup>
      <form.Field name="…">{(field) => <AppField field={field} label={…} required />}</form.Field>
    </FieldGroup>
    <AppFormActions isPending={…} submitLabel={…} />
  </form>
</CardContent></Card>
```

- **Field renderers live in `shared/components/`**, one per input kind, each taking a
  TanStack Form `field` plus `label`/`description`/`required` and rendering the errors
  below: `AppField` (text/email/password) · `AppTextareaField` · `AppSelectField` ·
  `AppCheckboxField` (one boolean) · `AppCheckboxGroupField` (membership of an array —
  supported languages, recurring weekdays) · `AppDateField` · `AppTimeField` ·
  `AppNumberField` · `AppPasswordField` · `AppArrayInput`. (`AppNumericInput` is the bare numeric control the
  number/price fields build on — not a form field itself.)
- `AppFormActions` — the footer: right-aligned submit with the pending spinner, plus an
  optional `secondary` slot (Cancel link, Clear-translation button).
- `AppAuthFormWrapper` — the auth-page shell (logo, card, inline error banner, **full-width**
  submit). Auth and onboarding are a different layout and skip `AppFormActions`.
- `use-<x>-form.ts` — the hook: `useForm` + a `useMutation`, mapping server errors to an
  inline `errorMessage` and navigating on success.
- `validators/<x>.ts` — a zod schema that **mirrors the backend value objects** (so a bad
  field fails client-side with a precise message instead of an opaque 422).

**Per-locale translation editors** (experience · page · operator, plus the single-field
`AppNameTranslations`) are one shape, and it is worth naming because it drifted once: an
`AppLocaleTabs` strip over a form keyed by locale, whose fields are all optional and whose
empty values collapse to `null` so the storefront falls back to canonical. An operator with
one configured language gets `AppNoTranslatableLocales` instead — there is no locale to
overlay onto — and a member without write access gets `AppTranslationSummary`, the
read-only face of the same fields. Inside the form:
the fallback rule renders as **`<AppAlert variant="info" title={m.translation()}>` above the
error alert** — not as a raw `<p>`, which is for per-field hints — a module-local
`hasTranslation(t)` decides whether *Clear translation* shows, and the footer is
`AppFormActions` with Clear in its `secondary` slot. **The `PUT` is a full replace
everywhere**, so the form always submits every field.

**The gate.** `src/shared/form-pattern.test.ts` fails when a component renders a `<form>`
containing **any** raw control (`Input` / `Textarea` / `Checkbox` / `Select` / `select` / …).
Every field goes through a renderer, with no exception for "it's a dynamic control" — if
none fits, **write the renderer**. That is exactly how `AppCheckboxGroupField` came to
exist: two forms were hand-rolling a checkbox-per-option group, which is R2's second real
use. **Nothing is allowlisted** — every form in the app renders its fields through a renderer.
A repeating row uses `mode="array"` plus `hideLabel` on the cell renderers, which keeps the
row compact while still giving every control a real programmatic label (a placeholder is
not one). A **recursive** tree (`AppMenuItemsEditor`) addresses its fields by path —
`items[2].children[0].title` — through a small structural view of the form, because
TanStack computes its typed key union by walking the value type and a recursive type makes
that walk non-terminating. The cast is made once, where the tree mounts. This gate exists because §5 was the one prescriptive rule
here with nothing enforcing it, and four settings cards drifted — two written by copying a
third.

> The archive's richer form *framework* (`AppFormWrapper` + a typed-input factory whose
> inputs hang off `form.AppField`) is still **deferred** and has not been re-earned:
> forms compose the field renderers directly. Reintroduce it only when a feature needs
> its breadth (R2).

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

Counts are a snapshot; **Storybook is the authoritative browsable catalog** (§6) and the
filesystem is the authoritative list. Regenerate the numbers rather than trusting them:

```bash
ls src/components/ui | wc -l                                   # primitives
find src -name 'App*.tsx' -not -name '*.stories.tsx' | wc -l   # App* components
find src -name '*.stories.tsx' | wc -l                         # stories
```

### `components/ui/` — shadcn primitives (radix-nova), 24 — vendored, no stories

`alert` · `avatar` · `badge` · `breadcrumb` · `button` · `calendar` · `card` · `checkbox` ·
`dialog` · `dropdown-menu` · `field` · `input` · `label` · `popover` · `select` ·
`separator` · `sheet` · `sidebar` · `skeleton` · `sonner` · `spinner` · `table` ·
`textarea` · `tooltip`

### `App*` components — 136, of which 132 ship a story

**`shared/` — 46.** The cross-cutting design layer.
- *Page frame:* `AppPageShell` · `AppPageHeader` · `AppPageActions` · `AppBreadcrumb` ·
  `AppBackLink` · `AppLink` · `AppNewLink` · `AppResourceLink`
- *States:* `AppResourceView` (loading / 404 / error around a page's query) · `AppCardBody`
  (the same for a **card's** query — pending / error-with-retry / loaded, no header and no
  404, because a settings singleton has neither) · `AppDetailSkeleton`
  (its `loading` placeholder — pass the field count, don't hand-roll the grid) ·
  `AppFormSkeleton` (the same for a form waiting on the record it edits — pass the row
  count, and `card={false}` inside a card that already has a header) ·
  `AppNotFound` · `AppError` · `AppEmptyState` · `AppNotPermitted` · `AppAlert` · `AppBadge`
- *Table:* `AppDataTable` · `AppDataTableHeader` · `timestampColumn` (the created /
  updated / joined column every list has — declare it, don't hand-roll it) (sorting is
  opt-in per column via
  `enableSorting: true` — the header reads it, and the `<th>` turns it into `aria-sort`) ·
  `AppTextFilter` · `AppSetFilter` ·
  `AppAsyncSetFilter` · `AppFilterInput`
- *Form fields:* see §5 — `AppField` · `AppTextareaField` · `AppSelectField` ·
  `AppCheckboxField` · `AppDateField` · `AppTimeField` · `AppNumberField` ·
  `AppPasswordField` · `AppArrayInput` · `AppNumericInput` · `AppFormActions`
- *States:* also `AppLoadingBlock` — the centred spinner for a short swap inside painted
  chrome (a locale tab, a card body). Nine copies of it sat across the translation editors.
- *Overlays:* `AppConfirmDialog` · `AppDialogFooter` (a dialog's Cancel + confirm pair, the
  `AppFormActions` of a dialog — Cancel is a `DialogClose`, so no caller wires it)
- *Detail / i18n / misc:* `AppDetailField` (renders the `dt`/`dd` pair — **always place it
  inside a `<dl>`**) · `AppSourceBlock` (operator-authored HTML shown
  verbatim, never rendered) · `AppConfirmDialog` · `AppLocaleTabs` ·
  `AppNameTranslations` · `AppNoTranslatableLocales` · `AppTranslationSummary` ·
  `AppImageDropzone`
- Not counted above (not `App*`, so no story owed): `useDataTable` — the table hook
  `AppDataTable` builds on — plus two one-glyph affordances, `RequiredMark` (a required
  field's asterisk) and `EmptyValue` (the muted em dash standing in for a value the record
  doesn't carry; use it rather than hand-rolling the span, which had drifted to ten copies).

**Modules — 97.** Each owns its list / detail / form / edit set:
`auth` 13 · `tour-operator` 10 · `policies` 6 · `metaobjects` 8 · `slots` 8 · `experiences` 7 · `menus` 7 ·
`metafields` 7 · `pages` 7 · `audiences` 5 · `team` 5 · `audit` 4 · `media` 4 ·
`pickup-locations` 4 · `contact` 2.

**Every `App*` component ships a story — 145 of 145 — and `src/shared/story-coverage.test.ts`
fails the build if one does not.** The four data-table internals that carried this debt since
July (`AppDataTable` · `AppDataTableHeader` · `AppAsyncSetFilter` · `AppFilterInput`) were
written before the gate landed, so its allow-list is **empty**. The two that need a real
`HeaderContext` are storied *through* a table, which is the only place they exist.

Add an entry to `EXEMPT` only for something that genuinely cannot be storied, with a
one-line reason; it is empty today.

### Providers — 2

`AuthProvider` (`auth/`) · `ThemeProvider` (`shared/theme.tsx`)

### Routes — 72 files under `routes/`

`__root.tsx` (shell + pre-paint theme guard) → `(app)/route.tsx` (auth gate) →
`(app)/tour-operators/$tourOperatorId/route.tsx` (workspace shell; `/settings/**` swaps
the operator sidebar for the settings rail). Everything else is a thin page.

### Not yet built — build to the shape above when a feature needs them

`AppSaveBar` · `AppModal` · the shared form framework (§5). These existed in the archive;
re-earn each on first real use, don't port speculatively. (`AppStatusBadge` is **not**
coming back as its own component — `AppBadge` is the seam, and semantic tones get added
there.)

> **Deferred conventions — consult the archive when you build the slice.** The detailed
> shapes for forms (full-width `AppFormWrapper` + typed-input factory + 2-col grid, *never
> hand-roll `<input>`+`<label>`*), data/cache (hierarchical query-keys,
> the create/update/delete/publish invalidation convention,
> `onError = toast.error(apiErrorMessage(err))`, branch on `code` never `message`),
> instants/money (operator-timezone formatters, minor-units), and the list/detail page
> vocabularies live in the archive's `ARCHITECTURE.md` (`/home/jefrycayo/archive-vointika/frontend`).
> Re-earn them into `shared/` per R2 when the feature that needs them lands.

### The operator app shell grows with features

The operator shell (`tour-operator/components/AppTourOperatorSidebar.tsx` + the
`$tourOperatorId` layout route) **grows with the pages it points at** — don't build shell
chrome ahead of them. When a feature slice adds an operator page, it also adds its **nav
leaf** to `tour-operator/nav-items.ts` (icon + `to`/`params`), in the right group.

**What exists.** `nav-items.ts` is the catalog: Dashboard, then three labeled groups —
**Catalog** (experiences, availability, audiences, pickup locations) · **Operations**
(inbox, activity) · **Content** (pages, media, metafields, metaobjects, menus) — with the
**Settings** leaf pinned in the sidebar footer. `/settings/**` is its own space (Shopify's
model): the layout route swaps `AppTourOperatorSidebar` for `AppSettingsSidebar`, whose
sections come from `settingsSectionItems` (General · Members · Invitations · Languages ·
Translations · Account). Pages open with `AppPageHeader`, wrapped in an `AppPageShell`
variant (§4), and nested pages carry an `AppBreadcrumb`.

**Role gating — `usePermissions()` from `#/tour-operator`.** Every write in the product is
ADMIN+ behind the backend's `ensureAdmin`; reads are `ensureMember`. So a write affordance a
STAFF member can see is a dead end. `usePermissions()` returns `{ canWrite, isOwner }` and
gates the affordance at its call site:

- **A "New X" button:** `action: canWrite && <AppNewLink …>`.
- **A detail page's actions:** `<AppPageActions actions={actions} canWrite={canWrite} />` —
  always this shape, at every site. The tier is declared on the action, not at the call
  site: an `AppAction` is ADMIN+ unless it sets `member: true`, and `AppPageActions` drops
  what the viewer may not run (returning `null` if that leaves nothing). `canWrite` is
  **required**, so a new call site that forgets the gate fails typecheck rather than
  quietly showing STAFF a 403. Set `member: true` only where the backend agrees — today
  that is the four `translations` links, the inbox's Reply + Mark-as-unread
  (`ensureMember`), and Leave team (membership alone). Conditions that shape *which*
  actions exist — an invitation's `PENDING`, a member's role vs the target's — stay in the
  builder; the flag is about tier, not state.
- **A per-locale translation editor:** `canWrite ? <Form/> : <AppTranslationSummary/>`.
  **Not** `AppNotPermitted` — reading a translation is `ensureMember`, so hiding the values
  would take away access STAFF has. All four editors take `canWrite` as a **prop** rather
  than calling the hook: `AppNameTranslations` lives in `shared/` and cannot call it at all,
  and a prop keeps every editor storyable in both states instead of throwing on a missing
  `AuthProvider`.
- **A settings form:** render a read-only summary instead — Settings → General's three
  cards and Languages all do this, since each writes through an ADMIN+ endpoint whose read
  is member-visible.
- **A `/new` or `/edit` page:** `canWrite ? <AppXForm …/> : <AppNotPermitted />`, keeping the
  page header so the visitor knows where they are and can navigate away. Hiding the button
  that leads somewhere never stopped a bookmark or a typed URL.

Two rules keep it honest. **It is cosmetic** — the backend re-checks every write, so a
hidden button is a courtesy, never a permission; don't let a reviewer read it as the
security boundary. And **don't hide what a member may actually do** — the read-only tiers
are real: marking a contact message read is `ensureMember`, and so is every translation
*read*, which is why the links into the per-locale editors stay visible for STAFF.

The check lives in `tour-operator/` and not `shared/` because `shared/` may not import a
feature module (§2) — so a `shared/` component can never *call* `usePermissions`, only
receive its answer. `AppNewLink` therefore leaves the decision to the call site, while
`AppPageActions` takes `canWrite` as a prop and applies it itself, the same way every
translation card does.

**Still deferred**, each re-earned with the feature that needs it: collapsible nav groups ·
the ⌘K command palette · a grouped
**settings hub** (`/settings` is a redirect to General) · a footer `AppLanguagePicker`
(admin-UI language lives in Settings → Account as `AppLanguageCard`). There is **no desktop
top bar** — the sidebar is always visible (toggle via its rail or Ctrl/Cmd+B); a mobile-only
strip holds the `SidebarTrigger`. **Sign-out is still unhoused**: the only trigger is on the
onboarding screen (`AppTourOperatorForm`), so a signed-in operator inside the app cannot
sign out. It needs an account menu — pick that home when the next account-shaped slice lands.
