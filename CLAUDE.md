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
7. **Every list passes an empty state**, in its own words, with no
   exception for a list that cannot be empty today: a rule with no exception
   is a rule nothing slips past. Gate: `src/shared/data-table.test.ts`.
8. **A list page is one shell, one breadcrumb header and one action a
   viewer never sees.** The action is `AppNewLink` to the create page, or a
   `Button` when the create is a dialog or an upload, written inline as
   `actions={canWrite && …}` so the gate can read it; a `Button asChild`
   around an `AppLink` is `AppNewLink` written by hand, in the route or in
   any `App` component it renders, a create dialog's empty state included.
   Gate:
   `src/shared/list-page.test.ts`. That there is only one action is by
   review; the gate reads the gating, not the count.
9. **A create or edit page is the write gate first, then one breadcrumb
   header, then one `AppFormCard` whose actions are `AppFormActions` with
   nothing beside submit.** `AppWriteGate` is the first child of the shell
   so a viewer sees Not Permitted and nothing else; the breadcrumb is the
   way back, so no cancel button; an edit loads its record through
   `AppResourceView`. The gate follows the route into every `App` component
   it renders, so the rule holds wherever the form lives. Gate:
   `src/shared/form-page.test.ts`.
10. **A translations page is the one write pattern a viewer may open.** No
    write gate; an editor gets the form and a viewer gets
    `AppTranslationSummary`; one breadcrumb header; the one-language state
    is `AppNoTranslatableLocales`; every form card carries
    `AppTranslationNotice`; the only button beside Save is
    `AppClearTranslationButton`; and the active locale's text is its own
    `QueryState` under `AppQueryState`, which the form and the summary both
    read. The translations list says which locales have text, which is what
    the tab dots are, and never what one of them says. Every one of the five
    `GET …/translations/{locale}` endpoints answers an untranslated locale
    with an empty record, never a `404`, so the overlay is always a form to
    fill in. Gate: `src/shared/translations-page.test.ts`.
11. **A settings page is a stack of self-describing cards a viewer can
    read.** No write gate; one breadcrumb header; every card is
    `AppSettingsCard` with a title and a description; a card's form is
    `AppForm` with nothing beside Save; inside a card a query loads as
    `AppFormSkeleton` with `card={false}`, or stays hidden with
    `loading={null}` until its chrome can decide; and a card with nothing to
    show says so through a shared element, `AppEmptyState variant="inline"`
    for an empty list and `EmptyValue` for a field with no value, never a
    paragraph of muted text of its own. Gate:
    `src/shared/settings-card.test.ts`, scoped to form-shaped routes that
    reach `AppSettingsCard` and no `AppLocaleTabs`, and for the empty-state
    rule to every file that builds an `AppSettingsCard`.
12. **A detail page has one breadcrumb header and one loading shape.**
    `AppResourceView`'s `loading` prop is `<AppDetailSkeleton fields={n} />`,
    never `AppFormSkeleton` borrowed from the write pattern and never a
    hand-rolled `Card` of `Skeleton` bars; a field long enough to scroll is
    `AppSourceBlock`, never a raw `<pre>`. Gate: `src/shared/detail-page.test.ts`,
    scoped to `variant="detail"` routes whose closure reaches
    `AppResourceView` — a marker independent of the rules the gate checks, so
    a page missing its breadcrumb fails rather than silently falling out of
    scope.
13. **A form names its save failure where the form is.** Every `AppForm`
    and `AppFormCard` passes `errorMessage`; the hook that saves it owns
    that message, sets it from `apiErrorMessage` on failure and clears it
    on the next success, and never reports the failure by toast: a toast
    is gone before the reader looks up, the alert stays above the fields
    until they try again. Success stays a toast. Gate:
    `src/shared/form-error.test.ts`, scoped to every file that renders
    `AppForm` or `AppFormCard`, wherever on the page the form sits. That
    no save hook also toasts its error is by review.
14. **The document says which language it is in.** `index.html` is served
    before any script runs, so its `lang` is the base locale and nothing
    else; `src/main.tsx` then assigns `document.documentElement.lang` from
    `getLocale()`, once, because `setLocale` reloads the page. A Spanish UI
    served as `lang="en"` has a screen reader pronouncing Spanish as
    English and a browser offering to translate text already in the
    reader's language. Gate: `src/shared/document-language.test.ts`.

## Page patterns

Every screen composes one of these, with the package's components and
nothing hand-rolled beside them. The census that named them is the
`resource-view` gate's ancestor; each pattern gets its gate as its round
lands.

| pattern | composition |
| --- | --- |
| list | `AppPageShell variant="list"`, `AppPageHeader` with a breadcrumb and one action behind `canWrite`, `AppDataTable` with an `emptyState` |
| detail | `AppPageShell variant="detail"`, `AppResourceView` with a back link on not-found, `AppPageHeader` with breadcrumb and `AppPageActions`, detail fields in cards |
| create | `AppPageShell variant="form"`, `AppWriteGate` first, `AppPageHeader` with breadcrumb, `AppFormCard` with `AppFormActions` and no second button |
| edit | the create pattern inside `AppResourceView` |
| translations | `AppPageShell variant="form"` with no gate, `AppPageHeader` with breadcrumb, `AppLocaleTabs` over one `AppFormCard` per locale (`AppTranslationSummary` for a viewer, `AppNoTranslatableLocales` with one language); `AppNameTranslations` when the name is the only translatable field |
| settings | `AppPageShell variant="form"` with no gate, `AppPageHeader` with breadcrumb in the route, then `AppSettingsCard`s each holding `AppQueryState` over `AppForm` for an editor or a `dl` of `AppDetailField` for a viewer |

Named variants: a read-only list has no action; a list whose create is a
dialog has a button where the others have a link; a read-only detail has no
page actions; a create that needs a parent record (a metaobject entry, a
slot for an experience) loads it through `AppResourceView` the way an edit
does; the first-run create-operator page is the auth shell with a card, not
a form page, because there is no operator to frame it yet; the operator's own translations page has no record to load,
so its header sits in the route rather than inside `AppResourceView`;
`AppNameTranslations` lives in `shared/`, which cannot import a module, so
its caller reads `usePermissions()` and passes `canWrite` in; the account
page's cards have no viewer branch because the account is the viewer's own;
the two metafields cards render nothing until their definitions are known
and show Save only once a field has changed, and they are settings cards
wherever they sit (a detail page, a translations page), gated by the
pattern that owns the page; a detail page's `AppActivityCard` names the
entity type the backend actually logs writes under, which is not always the
page's own record — the policy detail has none because the backend logs a
policy write against the tour operator, not the policy, and the contact
message detail has none because the backend never writes an audit entry for
one at all.

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
