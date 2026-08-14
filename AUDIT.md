# Frontend Audit — 2026-08-14

Investigation only; no code was changed. Every finding below is backed by a command that
was run or a file that was read end to end. Anything I could not confirm is in
[UNVERIFIED](#unverified--needs-human-check), not in the body.

## Baseline

All five gates pass on `staging` @ `dd4af51`+`8933529`:

```
typecheck ✓   check ✓ (1 info)   depcheck ✓ 451 modules / 1879 deps
test ✓ 83 files / 622 tests       build ✓ (2.4M client assets)
```

This is a codebase in good shape. The mechanical categories are genuinely empty — not
"nothing obvious", but zero after an exhaustive search (see §1). The real findings are
architectural: one abstraction built for callers that never arrived, one shape duplicated
four times that should have been abstracted, and a module that has quietly become a
shared layer while still being governed as a feature.

---

## 1. Dead code

### Verified empty

I searched for each of these across the whole repo and found nothing. Recording them so
the next audit doesn't redo the work:

| Check | Result |
|---|---|
| Unreferenced exports (all of `src/`, excl. generated) | **0** |
| Orphan modules (dependency-cruiser `no-orphans`) | **0** |
| Unused i18n keys | **0 of 655** |
| Commented-out code | **0** |
| `TODO` / `FIXME` / `XXX` / `HACK` | **0** |
| `console.*` in shipped source | **0** |
| Section-banner comments | **0** |
| Authorship / changelog comments | **0** |

Two exports looked dead to a naive scan and are **not**: `useIsMobile`
(`src/hooks/use-mobile.ts:5`) is consumed by `src/components/ui/sidebar.tsx:7`, and
`getRouter` (`src/router.tsx:11`) is referenced by generated `src/routeTree.gen.ts:1708`.

**Verified by:** a script walking every `.ts`/`.tsx` under `src/` (plus `package.json`,
both vite configs, `vitest.setup.ts`, `.storybook/*`, `smoke/smoke.mjs`, `messages/en.json`,
`.dependency-cruiser.cjs`), extracting every export name and word-boundary-grepping it
across all of them — 2 candidates, both then traced to a live consumer by hand;
`npx depcruise --output-type json` filtered to `no-orphans`; a script diffing
`Object.keys(messages/en.json)` against every `m.*` reference in `src/`;
`grep -rnE "^\s*//\s*(const|let|function|return|import|export|if \(|for \(|<[A-Z]|\}|\{)"`
(6 hits, all wrapped prose, read individually).

---

### 1.1 `TASK-endpoint-gap.md` — a finished slice's notes, tracked at the repo root

**File:** `TASK-endpoint-gap.md` (292 lines) · **Severity: medium**

A point-in-time backend-vs-frontend endpoint diff, committed to the repo root, referenced
by **nothing** — not `CLAUDE.md`, `README.md`, CI, or the parent repo's `MAP.md`. Its own
header calls it a "Snapshot basis: backend `main`, re-diffed 2026-08-14", and its coverage
table now reads 150/150 — the task it existed to track is done.

Per LAW §3 this is SCRATCH ("born with the slice, die with it"), and it is the exact
failure mode LAW warns about: a dated snapshot that is trusted and will silently stop
being true the next time the backend merges. It does carry two durable facts worth keeping
— the method for re-running the diff, and the module-cycle rationale for the og:image
upload path — which belong in `MAP.md`.

**Fix:** move the two durable paragraphs into `MAP.md`, delete the file. ~20 minutes.

**Verified by:** `grep -rn "TASK-endpoint-gap" . --include='*.md' --include='*.json'
--include='*.yml' --include='*.ts'` (excl. `node_modules`) and the same against
`/home/jefrycayo/vointika/*.md` — no hits outside the file itself; `head -25` / `tail -12`
of the file for the snapshot header and coverage line.

### 1.2 `.cta.json` — scaffold residue that contradicts the project

**File:** `.cta.json:5` · **Severity: low**

The `create-tsrouter-app` scaffold record. Nothing in the repo reads it and no tool that
reads it is installed. It also records `"packageManager": "npm"`, while the project is
pnpm (`package.json` `"packageManager": "pnpm@10.33.3"`, `pnpm-lock.yaml`, every documented
command). A stale file that is also factually wrong is worse than one that is merely stale.

**Fix:** delete. 1 minute.

**Verified by:** `grep -rn "cta.json" .` across `*.ts,*.tsx,*.mjs,*.cjs,*.json,*.yml,*.md`
excluding `node_modules`/`pnpm-lock.yaml` — no hits; `ls node_modules/.bin | grep -i "cta\|create-ts"`
— nothing installed; `cat .cta.json` and `cat package.json`.

### 1.3 Stale reference to a route that no longer exists

**File:** `.dependency-cruiser.cjs:139` (the `exclude.path` comment) · **Severity: low**

> `// Dev-only, same rationale as tests: the /_dev gallery and colocated stories import
> components across the tree`

There is no `/_dev` gallery. `src/dev/` holds one file, `story-utils.ts`, imported by
story files. The exclusion is still correct; only the justification names something gone.

**Fix:** reword to name `src/dev/story-utils.ts`. 2 minutes.

**Verified by:** `find src/routes -iname "*dev*"` → empty; `find src/dev -type f` →
`src/dev/story-utils.ts` only; `grep -rn "#/dev" src/` → 10+ story files import it.

### 1.4 `shadcn` sits in `dependencies` and nothing imports it

**File:** `package.json:39` · **Severity: low**

`shadcn@^4.1.2` is a **runtime** dependency. Nothing imports it, and `docs/COMPONENTS.md §1`
prescribes invoking it as `pnpm dlx shadcn@latest add <name>` — i.e. not from
`node_modules` at all. The only in-repo mention is `components.json`'s `$schema` URL, which
is a string, not a package resolution.

**Fix:** if the `pnpm dlx` workflow is the real one, remove it; if a pinned local CLI is
wanted, move it to `devDependencies`. 5 minutes plus a `pnpm install`.

**Verified by:** `grep -rn "from \"shadcn\|from 'shadcn\|require(.shadcn" src/ .storybook/ *.ts *.cjs`
→ no hits; `grep -rn -F "shadcn" src/ components.json .storybook/` → every hit is prose in a
comment or the `components.json` schema URL.

---

## 2. Over-engineering

### 2.1 `AppNameTranslations` — 269 lines and 9 props for one caller

**File:** `src/shared/components/AppNameTranslations.tsx:27-45` · **Severity: high**

A fully parameterized per-locale editor: it takes `endpointBase`, `queryKeyBase`,
`canonicalName`, `maxLength`, `translatable`, `localesPending`, `localeLabel`, `canWrite`
and `tourOperatorId`, and owns its own `useQuery` + `useMutation`. Its comment reads
"Parameterized by endpoint and query keys so each resource stays a thin wrapper" — plural.

There is exactly **one** resource: `AppAudienceTranslations`. `endpointBase` and
`queryKeyBase` exist to vary something that has never varied.

This is LAW §2.4's own test failing — *"name the caller that needs it; if you cannot, it
does not exist yet."* The generality also pushed it into `shared/`, where it can't call
`usePermissions`, which is why `canWrite` and `localeLabel` had to become props at all;
the abstraction paid for itself twice over and bought nothing.

**Fix (cheap):** leave it, delete `endpointBase`/`queryKeyBase`/`maxLength` and inline the
audiences values — reclaims the config surface without moving the file. ~1 hour.
**Fix (right):** fold it into `src/audiences/components/` as a concrete editor, and let
§3.2's shared shell (if built) cover the common part. ~2 hours.

**Verified by:** `grep -rn "AppNameTranslations" src/ --include='*.tsx'` excluding its own
file and stories → a single call site, `src/audiences/components/AppAudienceTranslations.tsx:74`;
`wc -l` → 269; read the `Props` interface and the call site in full.

### 2.2 A `shared/` component that owns endpoints and mutations

**File:** `src/shared/components/AppNameTranslations.tsx:1-20` · **Severity: low**

Same file, separate point. `docs/COMPONENTS.md §2` describes `shared/` as "the
cross-cutting `App*` layer over shadcn + `theme.tsx`". This one imports `authApi`,
`queryKeys`, `useMutation`, `useQueryClient` and `zod`, and builds request URLs. It is a
feature in the design layer. Folding it into `audiences/` (2.1) resolves this too.

**Verified by:** reading `src/shared/components/AppNameTranslations.tsx:1-20` (the import
block) against `docs/COMPONENTS.md §2`.

**Nothing else found.** I specifically checked for single-implementation strategy maps and
config that never varies: `OWNER_PATHS` (`src/metafields/hooks/use-owner-metafields.ts:17`)
has all three of its owner types in live use (`grep -rn '"tour_operator"' src/` →
`settings/general/index.tsx:67`, `settings/translations/index.tsx:29,59`; `"experience"`
and `"page"` likewise), and the 53 `queryKeys` entries produce 53 distinct arrays with no
collisions.

---

## 3. Under-engineering

### 3.1 Four translation-form hooks, ~50% byte-identical

**Files:** · **Severity: high**
- `src/experiences/hooks/use-experience-translation-form.ts` (107 lines)
- `src/pages/hooks/use-page-translation-form.ts` (100 lines)
- `src/policies/hooks/use-policy-translation-form.ts` (88 lines)
- `src/tour-operator/hooks/use-operator-translation-form.ts` (91 lines)

**47 lines are identical across all four.** The `clear` mutation is verbatim in every one:

```ts
// src/policies/hooks/use-policy-translation-form.ts:60-69
const clear = useMutation<void, AxiosError, void>({
    mutationFn: async () => {
        await authApi.delete(endpoint);
    },
    onSuccess: () => {
        setErrorMessage(null);
        toast.deleted(m.translation());
        invalidate();
    },
    onError: (error) => setErrorMessage(apiErrorMessage(error)),
});
```

```ts
// src/tour-operator/hooks/use-operator-translation-form.ts:58-67 — same ten lines
const clear = useMutation<void, AxiosError, void>({
    mutationFn: async () => {
        await authApi.delete(endpoint);
    },
    onSuccess: () => {
        setErrorMessage(null);
        toast.deleted(m.translation());
        invalidate();
    },
    onError: (error) => setErrorMessage(apiErrorMessage(error)),
});
```

The returned object is identical in all four (`{ form, errorMessage, isPending,
clear: clear.mutate, isClearing: clear.isPending }`). Only four things genuinely vary: the
endpoint string, the zod schema, the `defaultValues` mapping, and the invalidation keys —
plus whether a 409 maps to `m.slug_taken()` (experiences, pages) or falls through to
`apiErrorMessage` (policies, operator).

This is the mirror image of §2.1: the shape with **four** real uses stayed copy-pasted,
while the shape with **one** got abstracted. R2 ("componentize on the 2nd real use") was
applied to the wrong one.

**Fix:** a `useTranslationOverlayForm({ endpoint, schema, defaultValues, invalidateKeys,
conflictMessage? })` in `shared/hooks/`. Each of the four collapses to ~25 lines. It has no
feature-module dependency, so `shared/` is a legal home. ~3 hours including tests.

**Verified by:** `comm -12` chained across `sort -u` of all four files → 47 shared
non-blank lines; read all four end to end; `sed -n '/const clear = useMutation/,/^\t});/p'`
on each to confirm the block is verbatim.

### 3.2 Five hand-rolled copies of the locale-tabs editor shell

**Files:** · **Severity: medium**
- `src/tour-operator/components/AppOperatorTranslations.tsx:48-53`
- `src/policies/components/AppPolicyTranslations.tsx:39-44`
- `src/pages/components/AppPageTranslations.tsx:46-51`
- `src/experiences/components/AppExperienceTranslations.tsx:47-53`
- `src/audiences/components/AppAudienceTranslations.tsx:26-29` (filter only)

The same six lines open all five:

```ts
// src/pages/components/AppPageTranslations.tsx:46-51
const primary = localesQuery.data?.primaryLocale;
const translatable = (localesQuery.data?.supportedLocales ?? []).filter(
    (code) => code !== primary,
);
const [picked, setPicked] = useState<string>();
const active = picked ?? translatable[0];
```

```ts
// src/experiences/components/AppExperienceTranslations.tsx:47-53 — identical
const primary = localesQuery.data?.primaryLocale;
const translatable = (localesQuery.data?.supportedLocales ?? []).filter(
    (code) => code !== primary,
);
const [picked, setPicked] = useState<string>();
const active = picked ?? translatable[0];
```

followed in four of them by the same `<AppLocaleTabs>` block and the same
`canWrite ? <Form/> : <AppTranslationSummary/>` ternary. `docs/COMPONENTS.md §5` already
names this ("Per-locale translation editors … are one shape, and it is worth naming because
it drifted once") — the shape is documented but nothing holds it, so the doc is the only
enforcement, and it has already failed once by its own account.

**Fix:** a `useTranslatableLocales(tourOperatorId)` hook returning
`{ translatable, active, setPicked, primary, isPending }` kills the six-line preamble in
all five for very little risk. The tabs+form frame is a larger extraction and can wait.
~1.5 hours for the hook.

**Verified by:** `grep -rn "supportedLocales ?? \[\]" src/` → 5 sites;
`grep -rn "picked ?? translatable\[0\]" src/` → 5 sites;
`grep -rln "AppLocaleTabs" src/ --include='*.tsx'` excluding stories/tests → 5 files;
read all five components.

### 3.3 "GET one media asset" is written three times against one cache key

**Files:** · **Severity: medium**
- `src/media/hooks/use-media-by-ids.ts:14`
- `src/tour-operator/hooks/use-operator-brand.ts:29` (`useBrandImage`)
- `src/tour-operator/hooks/use-operator-seo.ts:28` (`useOperatorSeoImage`)

The last two are the same function under two names, and carry the same comment:

```ts
// src/tour-operator/hooks/use-operator-brand.ts:25-38
// Fetched here rather than through `#/media`'s useMediaByIds: `media` imports
// `#/tour-operator`, so reaching back through the barrel is a cycle.
export const useBrandImage = (tourOperatorId: string, mediaId: string | null) =>
    useQuery({
        queryKey: queryKeys.mediaAsset(tourOperatorId, mediaId ?? ""),
        enabled: !!mediaId,
        queryFn: async () => {
            const { data } = await authApi.get<{ id: string; url: string }>(
                `/tour-operators/${tourOperatorId}/media/${mediaId}`,
            );
            return data;
        },
    });
```

```ts
// src/tour-operator/hooks/use-operator-seo.ts:21-38 — same body, same comment
// Fetched here rather than through `#/media`'s useMediaByIds: `media` imports
// `#/tour-operator`, so reaching back through the barrel is a cycle.
export const useOperatorSeoImage = (
    tourOperatorId: string,
    mediaId: string | null,
) =>
    useQuery({
        queryKey: queryKeys.mediaAsset(tourOperatorId, mediaId ?? ""),
        enabled: !!mediaId,
        queryFn: async () => { /* identical */ },
    });
```

They write to the **same** `queryKeys.mediaAsset` cache entry, so this is one query
expressed three times. The duplication is a symptom of §5.1, not a cause; see there for
the real fix. In the meantime a single `useMediaAsset` in `shared/hooks/` (it needs only
`authApi` + `queryKeys`) would collapse all three legally.

**Fix:** `shared/hooks/use-media-asset.ts`; the three call sites re-export or call it.
~45 minutes.

**Verified by:** `grep -rn "mediaAsset(" src/` (excl. `query-keys.ts`, tests) → the three
sites plus consumers; read all three implementations; read
`src/lib/query-keys.ts` to confirm one shared key factory.

### 3.4 Five form hooks have no test, against the repo's own Tier-1 rule

**Files:** · **Severity: medium**

`docs/TESTING.md §2` lists "Request payload shaping (`use-*-form`)" under **Tier 1 — always
test**, because "a wrong field name is accepted and ignored, or silently clears a column".
Nineteen of twenty-four form hooks comply. These five do not:

| Hook | Untested logic |
|---|---|
| `src/auth/hooks/use-login-form.ts:33-40` | branches 401 → bad credentials, 403 → `notVerified` |
| `src/menus/hooks/use-menu-form.ts:48` | 409 → handle-taken branch |
| `src/metaobjects/hooks/use-metaobject-definition-form.ts:80` | 409 branch |
| `src/tour-operator/hooks/use-operator-translation-form.ts` | endpoint, invalidation, `clear` |
| `src/tour-operator/hooks/use-tour-operator-form.ts:33-36` | parses the created id out of the `Location` header |

`use-operator-translation-form` is the sharpest: its own comment says *"The PUT is a full
replace, so an OMITTED field is a CLEARED field"* — precisely the silent data-loss shape
TESTING.md wrote the rule for — and the other three translation form hooks are all tested.

Mitigating, and worth stating: the **validators** for the last two *are* tested
(`operator-translation.test.ts`, `tour-operator.test.ts`), so the empty→null collapse and
the field caps have coverage. The gap is the hook layer — endpoint, invalidation keys,
error mapping.

**Fix:** five test files in the shape of the existing `use-page-translation-form.test.ts`.
~3 hours. Note that §3.1's extraction would reduce this to testing one hook.

**Verified by:** a loop over `src/*/hooks/use-*-form.ts` checking for a sibling
`.test.ts` → 5 missing, 19 present; the same loop over `use-*-actions.ts` → **13/13
present**; a loop over `src/*/validators/*.ts` confirming `operator-translation.test.ts`
and `tour-operator.test.ts` exist; read each of the five hooks.

### 3.5 `useAllPages` drains a fixed 20-row page size, sequentially, before the UI paints

**File:** `src/hooks/use-all-pages.ts:34-45` · **Severity: medium**

The hook fetches every page of a cursor-paginated endpoint and holds `isPending` true until
the last one lands. Each request needs the previous response's cursor, so the round-trips
are **strictly sequential**, and the backend's page size is a compile-time constant the
frontend cannot raise:

```java
// backend/src/main/java/com/vointika/shared/list/ListConstants.java
public static final int PAGE_SIZE = 20;
```

`ListQuery` (`tenantId, filters, sort, cursor`) carries no limit field, so there is no
parameter to send. That makes the cost `ceil(rows / 20)` sequential round-trips before the
control is usable:

| Rows | Round-trips (blocking) |
|---|---|
| 40 | 2 |
| 200 | 10 |
| 500 | 25 |

The hook's own comment says "Safe for bounded catalogs (audiences, experiences); an
unbounded list needs server-side search instead." Two of its eight call sites drain
**experiences**, one drains **pages**, and one drains **metaobject entries** — operator
content with no ceiling. `AppAddAvailabilityDialog` and `AppMenuTargetSelect` block on it:

- `src/slots/components/AppAddAvailabilityDialog.tsx:40` — experiences
- `src/menus/components/AppMenuTargetSelect.tsx:42,46` — experiences **and** pages
- `src/metafields/components/AppMetaobjectEntrySelect.tsx:38` — metaobject entries

An operator with 300 experiences waits on 15 chained requests before the availability
dialog's picker is usable. This is not broken today; it degrades linearly and invisibly.

**Fix:** needs a backend server-side search/typeahead endpoint (out of this repo's scope —
hand to the backend session alongside the §19-endpoint list already in
`TASK-endpoint-gap.md`). Frontend-side interim: render the combobox as soon as the first
page lands and append, instead of gating on `isPending`. ~2 hours frontend, unknown backend.

**Verified by:** read `src/hooks/use-all-pages.ts` end to end;
`cat backend/src/main/java/com/vointika/shared/list/ListConstants.java` and
`head -40 .../ListQuery.java` for the fixed size and absent limit;
`grep -rn "useAllPages" src/` excluding tests → 8 call sites, each read to identify the
endpoint it drains.

### 3.6 `useMediaByIds` is an N+1 on gallery render

**File:** `src/media/hooks/use-media-by-ids.ts:12-25` · **Severity: low**

One `GET /media/{id}` per gallery image via `useQueries`. Mitigated by `staleTime:
Number.POSITIVE_INFINITY` and a shared per-id cache, and the requests are parallel, not
chained — so this is much softer than §3.5. A 30-image experience still opens with 30
requests on a cold cache. The hook's comment documents why per-id was chosen (the resolved
`galleryUrls` drop deleted ids and so aren't 1:1 with `mediaIds`), which is a real reason.

**Fix:** a batch `GET /media?ids=` endpoint — backend-side. No frontend fix worth making.

**Verified by:** read `src/media/hooks/use-media-by-ids.ts` in full; `grep -rn "useMediaByIds" src/`
→ one real consumer, `src/experiences/components/AppExperienceMediaSection.tsx:30`.

---

## 4. Bad practices

### Security — verified clean

I traced the auth surface from the entry point and found nothing to report. Recording the
checks so they aren't repeated:

- **Access token is memory-only** (`src/lib/tokens.ts` — a module variable, no persistence).
  The only `localStorage` use is the `theme` key (`src/shared/theme.tsx:26,35`), which
  `CLAUDE.md` documents as the deliberate exception. No `sessionStorage`. The one
  `document.cookie` write is in vendored `components/ui/sidebar.tsx:85` (upstream shadcn,
  sidebar open/closed).
- **One `dangerouslySetInnerHTML`** (`src/routes/__root.tsx:52`), fed a module-level
  constant with no interpolation, carrying a `biome-ignore` with a reason. No `eval`, no
  `new Function`, no `innerHTML`.
- **Refresh is de-duplicated and loop-guarded** (`src/lib/api.ts:32-46,66-86`), and both
  properties have tests that were written to fail — `src/lib/api.test.ts` includes
  "refreshes ONCE for many simultaneous 401s" and "gives up after one retry when the 401
  repeats", the latter deliberately letting the endpoint relent on the 6th call so a broken
  guard fails fast instead of hanging.
- **`/auth/change-password` is in `SKIP_AUTH_URLS`** with the correct reasoning (a 401 there
  means the *current password* was wrong, not that the session expired).
- Role gating is documented as cosmetic-only in `docs/COMPONENTS.md §8`, with the backend
  re-checking every write — the right framing.

**Verified by:** read `src/lib/api.ts`, `src/lib/tokens.ts`, `src/auth/AuthProvider.tsx`,
`src/routes/__root.tsx` and `src/routes/(app)/route.tsx` end to end;
`grep -rn "localStorage\|sessionStorage\|document\.cookie" src/`;
`grep -rn "dangerouslySetInnerHTML\|innerHTML\|eval(\|new Function" src/`;
`grep -rn "authApi\.\(post\|get\|put\|delete\)(\s*[\"\`]/auth" src/` to confirm every auth
call site uses a literal that `SKIP_AUTH_URLS` matches exactly.

One thing I checked and **disproved**: `TanStackDevtools` is rendered unguarded in
`src/routes/__root.tsx:67-75` with the devtools packages in `dependencies`, which looks
like a devtools panel shipping to production. It does not — `@tanstack/devtools-vite`
strips it. A `pnpm build:production` bundle contains zero occurrences of `TanStackDevtools`,
`TanStackRouterDevtoolsPanel`, `devtools-panel`, or the literal plugin-name string
`"Tanstack Router"` from that file. **Verified by:** `pnpm build:production` then
`grep -rl` for each of those strings across `dist/client/` — all zero. (The one
`tanstack-devtools` hit is inside the form library's chunk, unrelated.)

### 4.1 Five packages are pinned to `latest`, including the router and app framework

**File:** `package.json:37,40,41,42,68` · **Severity: medium**

```json
"@tanstack/react-devtools": "latest",
"@tanstack/react-router": "latest",
"@tanstack/react-router-devtools": "latest",
"@tanstack/react-start": "latest",
"@tanstack/devtools-vite": "latest"
```

CI is safe (`pnpm install --frozen-lockfile`), so this is not an active breakage. The risk
is local: any `pnpm add` or `pnpm update` re-resolves all five, which means the routing
spine and the build framework can move underneath a change that had nothing to do with
them — and the resulting lockfile diff lands in whatever PR was open. `docs/STACK.md` is
honest about it ("they drift on any reinstall — re-read them rather than trusting the
number"), which is evidence the cost is already understood rather than a reason to accept it.

Currently resolved: `react-router` 1.170.18 · `react-start` 1.168.32 · `react-devtools`
0.10.8 · `react-router-devtools` 1.167.0 · `devtools-vite` 0.8.1.

**Fix:** pin to the resolved versions (they are already recorded in `STACK.md`). ~15 minutes.

**Verified by:** a node one-liner over `package.json` listing every dep whose specifier is
exactly `latest` → 5; `require('<pkg>/package.json').version` for each to get the resolved
version; `head -30 docs/STACK.md` for the acknowledgement.

### 4.2 The `check` gate cannot see four config files, including `.storybook/preview.tsx`

**File:** `biome.json:10-20` · **Severity: medium**

`files.includes` is an allow-list that names `**/src/**/*`, `**/.vscode/**/*`,
`**/vite.config.ts` and `**/smoke/**/*`. It therefore skips:

```
UNCHECKED  vitest.config.ts
UNCHECKED  vitest.setup.ts
UNCHECKED  .storybook/preview.tsx
UNCHECKED  .storybook/main.ts
UNCHECKED  .storybook/check-index.mjs
UNCHECKED  .dependency-cruiser.cjs
```

`vite.config.ts` is enumerated but its four siblings are not, which reads as an oversight
rather than a decision. `.storybook/preview.tsx` matters most: it holds every global
decorator — theme, React Query, tooltips, and auth — that all 283 stories mount through
(`docs/COMPONENTS.md §6`), so it is real React source outside lint and format entirely.

**Fix:** add `**/vitest.config.ts`, `**/vitest.setup.ts`, `**/.storybook/**/*` and
`**/.dependency-cruiser.cjs` to `includes`, then run `pnpm check --write` once. ~20 minutes
including whatever it flags.

**Verified by:** `npx biome check <file>` on each of nine candidate files individually,
classifying by whether Biome reported the file as not included — output reproduced above;
`cat biome.json`.

### 4.3 `biome.json` declares a schema version two minors behind the CLI

**File:** `biome.json:2` · **Severity: low**

```
i The configuration schema version does not match the CLI version 2.4.5
> 2 │ "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
i Run the command biome migrate to migrate the configuration file.
```

This is the single `info` in an otherwise clean gate run — the one piece of standing noise
that trains people to skim `pnpm check` output.

**Fix:** `pnpm exec biome migrate --write`. 5 minutes.

**Verified by:** `pnpm check 2>&1` (full message reproduced above); `cat biome.json`.

### 4.4 Devtools packages sit in `dependencies`

**File:** `package.json:37,41` · **Severity: low**

`@tanstack/react-devtools` and `@tanstack/react-router-devtools` are runtime deps. They are
stripped from the bundle (proven above), so this is hygiene, not a shipping bug — but
`pnpm install --prod` installs them for nothing.

**Fix:** move to `devDependencies`. 5 minutes. Confirm the build still passes, since
`__root.tsx` imports them unconditionally.

**Verified by:** `cat package.json`; the bundle greps recorded above.

**Not found:** swallowed errors (all 6 `catch` blocks carry an explanatory comment and
either return a value or deliberately no-op), N+1 queries in list rendering (`grep -rn
"useQuery\|useResource(" src/*/columns.tsx` → none), shared-state mutation, or query-key
collisions (53 entries, 53 distinct arrays).

---

## 5. Drift

### 5.1 `tour-operator` is a shared layer governed as a feature module

**Files:** `.dependency-cruiser.cjs:21-37`, `src/tour-operator/hooks/use-current-tour-operator.ts`
· **Severity: high** (architectural; nothing is broken today)

**Fourteen of the sixteen** feature modules import `#/tour-operator` — audiences, audit,
contact, experiences, media, menus, metafields, metaobjects, pages, pickup-locations,
policies, slots, team (plus `routes/`). Mostly for two hooks: `usePermissions` and
`useOperatorDateTime`.

Because `tour-operator` is listed in `MODULES`, the `no-circular` rule makes that a
one-way street: nothing it needs can be imported back. Its own dependencies are trivial —

```ts
// src/tour-operator/hooks/use-current-tour-operator.ts
import { useParams } from "@tanstack/react-router";
import { type TourOperatorSummary, useAuth } from "#/auth";
```

— a router param and the auth user. Neither is a tour-operator domain concept.
`usePermissions` is six lines on top of it; `useOperatorDateTime` is an `Intl` wrapper on
top of it. These are cross-cutting concerns wearing a feature module's coat.

The cost is already paid, three times, each documented in-place as a workaround:

1. `src/tour-operator/hooks/use-operator-brand.ts:25` — re-implements the media fetch,
   *"`media` imports `#/tour-operator`, so reaching back through the barrel is a cycle"*
2. `src/tour-operator/hooks/use-operator-seo.ts:21` — the same function again, same comment
3. `src/tour-operator/components/AppOperatorTranslations.tsx:26-31` — took two render-prop
   parameters (`alsoTranslated`, `perLocale`) so the route could inject what the module
   cannot import: *"`metafields` imports `#/tour-operator`, so importing it back is a cycle
   (verified — 6 `no-circular` errors)"*

That third one is also §5.2 below. Every new module that needs both permissions and a
media asset will hit this again, and the workaround is invisible to `depcheck` — the gate
stays green precisely because the duplication is what keeps it green.

`docs/COMPONENTS.md §8` explains the placement as forced: *"`shared/` may not import a
feature module (§2) — so a `shared/` component can never call `usePermissions`."* That is
true but circular: `usePermissions` is unreachable from `shared/` because it was put in a
module, and it is in a module because `shared/` can't reach it.

**Fix:** the honest version is to recognise the session/operator context as infrastructure
rather than a feature — move `useCurrentTourOperator`, `usePermissions`,
`useOperatorDateTime`, `localeLabel` and `useOperatorLocales` into `shared/`, which requires
`AuthProvider`/`useAuth` to move there too (the auth *screens* stay a feature module; the
auth *context* is not one). That is a real refactor: ~1 day, touching 14 modules' imports,
with `depcheck` and 622 tests as the safety net. The three workarounds above then delete
themselves.

The cheap alternative — leave it, and accept one more duplicated hook per collision — is
defensible while the module count is stable. It should be a decision recorded in `MAP.md`,
not a thing that keeps happening.

**Verified by:** `grep -rln 'from "#/tour-operator"' src/*/` excluding tests and stories,
reduced to module names → 14; read `use-current-tour-operator.ts`, `use-permissions.ts`,
`use-operator-date-time.ts` in full; read all three workaround sites and their comments;
`grep -rn 'from "#/tour-operator"' src/media/` → `useOperatorDateTime`, `usePermissions` only.

### 5.2 Three shapes for "load one locale's overlay"

**Files:** · **Severity: medium**

| Module | Shape |
|---|---|
| experiences, pages, tour-operator | per-locale `useXTranslation(op, id, locale)` hook + a `xTranslation` query key |
| **policies** | no per-locale hook and **no `policyTranslation` key** — the overlay is `listQuery.data?.find(t => t.locale === active)` |
| audiences | neither — delegates wholesale to the generic `AppNameTranslations` (§2.1) |

```ts
// src/policies/components/AppPolicyTranslations.tsx:46-52 — the odd one out
// An untranslated locale has no row at all, so the empty overlay is ours.
const overlay: PolicyTranslation = (active &&
    listQuery.data?.find((t) => t.locale === active)) || {
    locale: active ?? "", title: null, body: null,
};
```

Policies' approach is arguably the *simpler* one — it needs one request instead of two —
but it is unexplained as a divergence, and it means `usePolicyTranslationForm.invalidate`
correctly invalidates two keys where its three siblings invalidate three, which looks like
a bug until you find the reason. Nothing marks it as deliberate.

**Fix:** either converge on one shape (the §3.1 extraction is the natural moment), or add
one line to `docs/COMPONENTS.md §5` saying policies derives from the list and why.
~15 minutes for the doc note; the convergence is part of §3.1.

**Verified by:** `grep -n "policyTranslation" src/lib/query-keys.ts` → only the plural
`policyTranslations` exists; `grep -rn "export const use.*Translation\b" src/*/hooks/use-*-translations.ts`
→ four modules have a singular hook, policies does not; `ls src/policies/hooks/`; read all
four editors and all four form hooks.

### 5.3 `AppOperatorTranslations` renders the metafield card by render prop; its two siblings inline it

**File:** `src/tour-operator/components/AppOperatorTranslations.tsx:33-43` · **Severity: medium**

Same screen, same job, two mechanisms:

```tsx
// src/pages/components/AppPageTranslations.tsx:147-156 — inline
{active && (
    <AppMetafieldTranslationsCard
        key={active} tourOperatorId={tourOperatorId}
        ownerType="page" ownerId={pageId} locale={active} canWrite={canWrite} />
)}
```

```tsx
// src/tour-operator/components/AppOperatorTranslations.tsx:96 — injected by the route
{active && perLocale?.(active)}
```

The reason is real and documented (§5.1's cycle), and the two extra props are the minimum
that works. But a reader comparing the three editors sees an inconsistency whose cause
lives in a different file. This is a symptom entry — fixing §5.1 removes it; nothing else
should be done to it in isolation.

**Verified by:** read both files; `grep -rn 'ownerType=' src/ --include='*.tsx'` excluding
stories/tests → 6 sites, showing which compose inline vs. through the route.

### 5.4 `docs/COMPONENTS.md §8` inventory counts are stale

**File:** `docs/COMPONENTS.md:303-360` · **Severity: medium**

| Claim | Doc | Actual |
|---|---|---|
| `App*` components | 153 | **154** |
| "Every `App*` component ships a story — **150 of 150**" | 150 | **154 of 154** |
| Stories held in those files | 274 | **283** |
| `shared/` | 48 | **49** |
| `tour-operator` | 13 | **15** |
| `metafields` | 7 | **8** |
| Primitives — count | 26 | 26 ✓ |
| Primitives — enumerated names | **24 listed** | 26 exist (`command`, `input-group` missing) |

`CLAUDE.md:151` says 283 and is correct, so the two docs now disagree with each other.
The section does carry a "Counts are a snapshot" disclaimer with the regeneration commands
— which is the right instinct — but "150 of 150" reads as a hard guarantee, not a snapshot,
and the missing primitive names are a list error rather than a stale number.

**Fix:** re-run the three commands the section already documents and paste the results;
add `command` and `input-group`. ~15 minutes. Better: since the gate already computes these,
have `story-coverage.test.ts` print the count so the doc has a source.

**Verified by:**
`find src -name 'App*.tsx' ! -name '*.stories.tsx' ! -name '*.test.tsx' ! -path 'src/components/ui/*' | wc -l` → 154;
`find src -name '*.stories.tsx' | wc -l` → 154;
`grep -rhoP '^export const \w+' --include='*.stories.tsx' src | wc -l` → 283, matching the
suite's own `story-render.test.tsx (283 tests)`;
per-module `find` loop for the breakdown; `ls src/components/ui` → 26 including `command`
and `input-group`.

### 5.5 "The PUT is a full replace **everywhere**" is no longer true

**Files:** `docs/COMPONENTS.md:218-219` vs `src/metafields/hooks/use-metafield-translation-save.ts:11-24`
· **Severity: medium**

The doc:

> **The `PUT` is a full replace everywhere**, so the form always submits every field.

The code, in a card that renders *inside* those very editors:

> **The PUT is a patch, not a replace** — verified against the use case, whose own
> controller javadoc says otherwise. An absent key is left alone and a **blank value
> clears** that key.

Both are accurate about their own endpoint — the canonical-field PUT does replace, the
metafield-translations PUT patches. The word "everywhere" is what broke when the metafield
translations slice landed. This is the highest-consequence doc error in the repo: the two
semantics differ on exactly the question of what an omitted field does, the failure is
silent data loss, and someone building the sixth translation editor will read the doc, not
the hook.

**Fix:** change "everywhere" to name the canonical-field editors, and add one line pointing
at the metafield overlay as the exception. ~10 minutes.

**Verified by:** quoted both lines; read `use-metafield-translation-save.ts` and all four
canonical translation form hooks (three of which repeat the full-replace claim in their own
comments, correctly).

### Checked and clean

- **`docs/STACK.md` version table:** all **43** documented versions match `node_modules`
  exactly. **Verified by:** a script extracting every `| \`pkg\` | version |` row and
  comparing against `require('<pkg>/package.json').version` — zero mismatches.
- **`CLAUDE.md`'s numeric claims**, which I expected to be the weak spot and were not:
  "thirteen" action hooks → 13; "five do the latter" (toast `apiErrorMessage`) →
  exactly those five named, and "the other eight" → exactly eight; "all sixteen sites"
  that branch on HTTP status → 16 files (13 on 409 + `use-login-form`,
  `use-reset-password-form`, `use-accept-invitation`); token-drift `KNOWN_DRIFT` "empty" →
  `{}`; story-coverage `EXEMPT` "empty" → `new Set([])`; "249 rows" in the country picker →
  the backend migration's own header says 249.
- **`docs/COMPONENTS.md §5`'s "eighteen call sites"** for `AppFormCard` → **17**. Off by
  one, low severity, folds into the §5.4 refresh.

**Verified by:** the greps and loops recorded in each of §5.4's rows plus
`grep -rln "<AppFormCard" src/` (17), `grep -rn 'onSubmit={form.handleSubmit}' src/` (17),
and `grep -oE "^\s*\('[A-Z]{2}'" backend/.../V6__all_countries.sql` cross-checked against
that migration's comment.

---

## 6. Comment noise

**The premise does not hold, and I am reporting that rather than manufacturing a list.**

Measured across 662 source files (excluding `paraglide/`, `routeTree.gen.ts` and vendored
`components/ui/`): **2,226 comment lines in 41,355 total — 5.4%.** Every category you asked
me to flag for deletion came back empty:

| Category | Found |
|---|---|
| Comments restating the next line | **0** |
| Section banners (`// ===== HELPERS =====`) | **0** |
| Commented-out code | **0** |
| Generation narration ("Now we handle…") | **0** |
| Changelog / authorship | **0** |
| Obvious ownerless `TODO` | **0** |

**Verified by:** a density script counting `//`, `/* */` and `{/* */}` lines per file; a
restatement detector that, for every single-line comment not adjacent to another comment,
tokenised the comment and the following line (splitting camelCase) and flagged ≥60% word
overlap — **0 candidates**; `grep -rn "^\s*//\s*[=#*-]\{4,\}"` → none;
`grep -rnE "^\s*//\s*(const|let|function|return|import|export|if \(|for \(|<[A-Z]|\}|\{)"`
→ 6 hits, all wrapped prose, each read;
`grep -rniE "^\s*//.*(added by|updated by|[0-9]{1,2}/[0-9]{1,2}/[0-9]{2,4}|@author)"` → none;
`grep -rn "TODO\|FIXME\|XXX\|HACK"` → none outside generated files.

All 17 `biome-ignore` comments carry a specific reason (e.g. *"a field can repeat (one
capacity diff per tier), so position is the identity"*). All 6 `catch` blocks carry an
explanation. The JSDoc one-liners I sampled carry wire semantics or business rules, not
type restatements — `/** Immutable after create, unique per operator. */`,
`/** Read-only, and absent from PATCH: it is the storefront subdomain. */`.

My read is that a previous pass already did this work, and the remaining comments are
overwhelmingly the WHY kind your brief says to keep. Two narrow findings survive:

### 6.1 One rationale stated three times in twenty lines

**File:** `src/tour-operator/components/AppOperatorAddressFields.tsx:14-18, 26-32, 36`
· **Severity: low** · **Delete two of three**

Why the `form` prop is loosely typed is explained in the component JSDoc, again in the prop
JSDoc, and gestured at a third time in the `biome-ignore`:

1. *"The form is typed by the surface used rather than by TanStack's form generics, the way
   AppAuthFormWrapper types its own — the two callers' forms differ in every field except
   `address`."*
2. *"Typed by the surface used, the way AppAuthFormWrapper types its own form prop.
   TanStack's `Field` carries twelve generics that differ per form, so there is no shared
   type…"*
3. *"biome-ignore lint/suspicious/noExplicitAny: no shared FieldComponent type — see above"*

**Keep** #2 (it is the one with the actual detail — twelve generics) and #3 (a lint
suppression needs its own reason). **Delete** #1's second paragraph from the component
JSDoc. ~5 minutes.

### 6.2 A paragraph duplicated between code and doc

**File:** `src/tour-operator/components/AppSignOutButton.tsx:11-16` vs `docs/COMPONENTS.md §8`
· **Severity: low** · **Delete one copy**

The "deliberate stopgap" rationale for sign-out living in both sidebar footers is written
out nearly verbatim in both places. LAW §3 is explicit: *"If a fact moved, delete the old
copy; never leave both"* — two copies means one will rot. Keep the code comment (it is
where someone about to move the button will look) and reduce the doc to a pointer, or vice
versa. ~10 minutes.

### Keepers — do not strip these

Named explicitly, since a future stripping pass will be tempted:

- `src/lib/api.ts:19-23` — why `/auth/change-password` skips the refresh interceptor.
- `src/hooks/use-all-pages.ts:36-43` — why the effect keys on the cursor and not
  `hasNextPage`; documents a real stall that shipped.
- `src/lib/query-retry.ts:3-7` — why a 404 is not retried, with the 7s cost it removed.
- `src/metafields/hooks/use-metafield-translation-save.ts:11-24` — patch-not-replace, and
  that the backend's own javadoc contradicts it. The single most valuable comment here.
- `src/tour-operator/hooks/use-operator-brand.ts:25` and `use-operator-seo.ts:21` — the
  cycle rationale (§3.3/§5.1). Duplicated, but each is load-bearing where it sits.
- `src/tour-operator/components/AppOperatorTranslations.tsx:20-31` — why the render-prop
  parameters exist, including the verified error count.
- `src/tour-operator/hooks/use-tour-operator-form.ts:16-18` — why there is no PATCH
  (changing currency/timezone would corrupt frozen prices).
- `src/routes/__root.tsx:20-22` — the FOUC guard and the localStorage exception.
- `.dependency-cruiser.cjs:97-99` — why `tsPreCompilationDeps` is on (without it every
  `types.ts` is a false-positive orphan). This one is why §1's orphan check is trustworthy.
- Every `biome-ignore` reason, and the ordering note in
  `src/media/components/AppMediaPicker.tsx:39`.

---

## UNVERIFIED — needs human check

1. **`skills-lock.json`** — nothing in this repo reads it and no tool that would is
   installed, but it plausibly belongs to a Claude Code / shadcn skills integration living
   outside the repo. I could not rule that out, so I am not calling it dead.
   *What I could not confirm:* whether an external tool consumes it.

2. **Removing `shadcn` from `dependencies` (§1.4)** — I verified nothing imports it. I did
   **not** run the removal plus a clean install and build, because this pass changes no
   files. The claim "nothing references it" is verified; "nothing breaks without it" is not
   (LAW §4 distinguishes these).

3. **`@tanstack/router-plugin` as a direct dependency** — no source file references it, and
   it also arrives transitively via `@tanstack/react-start` → `@tanstack/start-plugin-core`.
   It looked unused, but `docs/STACK.md` documents it as the generator behind
   `routeTree.gen.ts`, so the explicit entry is plausibly a deliberate version pin. **Not**
   reported as dead. *What I could not confirm:* whether the direct entry pins a version the
   transitive resolution would otherwise float.

4. **§3.5's operator-scale numbers** — the round-trip arithmetic follows from `PAGE_SIZE = 20`
   and sequential cursoring, both verified in source. I did **not** measure real latency
   against a running backend, and I have no data on how many experiences a real operator has.
   The mechanism is verified; the urgency is an estimate.

---

## The five I would fix first

1. **§5.5 — "The PUT is a full replace everywhere" (10 min).** Highest consequence per
   minute in the whole report. The two PUT semantics differ on precisely what an omitted
   field does; getting it wrong is silent data loss; and the doc is what the next person
   reads. Ten minutes to close a trap that is already armed.

2. **§4.2 — Bring `.storybook/`, `vitest.config.ts`, `vitest.setup.ts` and
   `.dependency-cruiser.cjs` under Biome (20 min).** A gate with a hole in it is worse than
   no gate, because it is trusted. `.storybook/preview.tsx` carries the decorators all 283
   stories mount through and is currently outside lint and format entirely. Do §4.3's
   `biome migrate` in the same pass and the gate output goes fully clean.

3. **§3.1 — Extract the translation-overlay form hook (3 h).** 47 identical lines across
   four files, with the `clear` mutation verbatim in all four. It is the largest concrete
   duplication in the codebase, the extraction has no feature-module dependency so it is a
   legal `shared/` resident, and it collapses §3.4's five-hook test gap into one hook worth
   testing properly. Best ratio of risk removed to hours spent.

4. **§5.4 — Regenerate the `COMPONENTS.md §8` inventory (15 min).** Cheap, and it matters
   more than a stale number usually would: `CLAUDE.md` and `COMPONENTS.md` now disagree with
   each other on the story count, and "150 of 150" reads as a guarantee. Two docs
   contradicting each other is the state LAW §3 exists to prevent.

5. **§5.1 — Decide about `tour-operator` (1 day, or 30 min to record the decision).**
   The only finding that will keep costing. Fourteen of sixteen modules import it, it has
   already forced three duplicated workarounds, and `depcheck` stays green *because* of the
   duplication — so nothing will ever surface the fourth. This does not have to be fixed
   now, but it should stop happening by accident: either move the session/operator context
   into `shared/`, or write into `MAP.md` that the hub is deliberate and duplicating a hook
   is the accepted price. The one option I would rule out is leaving it undecided.

**Deliberately not in this list:** §2.1 (`AppNameTranslations`) and §3.5 (`useAllPages`
scale). The first is real over-engineering but harms nobody today and is best folded into
§3.1's work; the second needs a backend endpoint that does not exist, so it belongs on the
hand-off list next to the 19 undocumented endpoints already in `TASK-endpoint-gap.md`,
not on a frontend sprint.
