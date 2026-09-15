# Vointika admin

This app is the operator's admin. It owns its screens, its routes, its
contract with the backend, and three adapters that hand `@vointika/ui` a
client, a label set and a router Link. Everything that renders without
naming a route or writing to the API lives in the package, not here.

## Rules, each with the gate that enforces it

A rule is a test with an empty allow-list, or it is a habit. Where a line
says "no gate", the rule holds by review only, and that is written here so
the list never pretends.

1. **Forms use the field renderers.** No raw control where an App field
   exists. Gate: `src/shared/form-pattern.test.ts`.
2. **A query that can load can fail, and must say so.** No pending branch
   without a failure branch; a spinner only as a `loading` prop; every error
   says why. Gate: `src/shared/query-state.test.ts`.
3. **Query keys come from one place.** No literal array at a key use site.
   Gate: `src/shared/query-keys.test.ts`.
4. **Tokens only.** No raw palette class, no arbitrary value, no inline
   style, one exemption for the brand swatch. Gate:
   `src/shared/token-drift.test.ts`.
5. **The list grammar the package sends is the one the backend parses.**
   Gate: `src/shared/list-grammar.test.ts`, kept here because this repo can
   read the backend's parser and the package cannot.
6. **A resource page's not-found state offers a named way back to its
   list**, `m.back_to_x`, never the package's generic button: a visitor from
   a bookmark has no history to go back to. Gate:
   `src/shared/resource-view.test.ts`.

## Page patterns

Every screen composes one of these, with the package's components and
nothing hand-rolled beside them. The census that named them is the
`resource-view` gate's ancestor; each pattern gets its gate as its round
lands.

| pattern | composition |
| --- | --- |
| list | `AppPageShell variant="list"`, `AppPageHeader` with a breadcrumb and one action, `AppDataTable` with an `emptyState` |
| detail | `AppPageShell variant="detail"`, `AppResourceView` with a back link on not-found, `AppPageHeader` with breadcrumb and `AppPageActions`, detail fields in cards |
| create | `AppPageShell variant="form"`, `AppPageHeader` with breadcrumb, `AppFormCard` with `AppFormActions` |
| edit | the create pattern inside `AppResourceView` |
| translations | the edit pattern with `AppLocaleTabs`, or `AppNameTranslations` when the name is the only translatable field |
| settings card | a stack of self-saving cards under one header |

Named variants: a read-only list has no action; a list whose create is a
dialog has a button where the others have a link; a read-only detail has no
page actions.

## Gates

```
pnpm paraglide:compile
pnpm typecheck && pnpm check && pnpm depcheck && pnpm knip && pnpm test && pnpm build
```

## Working rules

- Ship on a branch through a pull request into `staging`. Never merge
  unless asked. `staging` deploys.
- The package is consumed by tag. A change to a component from
  `@vointika/ui` is made there, tagged, and the dependency repointed.
- A test earns its place when a mutation kills it. Name the mutation in
  the PR.
- Never write history into the repo. Present tense.
