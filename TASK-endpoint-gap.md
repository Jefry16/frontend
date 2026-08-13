# Endpoint Gap Inventory — backend endpoints not yet used by the frontend

Point-in-time diff of the **backend admin HTTP surface** vs **what the admin frontend
consumes**. Tick an endpoint when a real frontend consumer ships.

> **Snapshot basis:** backend `main`, re-diffed **2026-08-08** by enumerating every
> `@(Get|Post|Put|Patch|Delete)Mapping` under `presentation/controller` and matching each
> against the frontend source. **137 admin endpoints** across the 11 contexts with an admin
> HTTP surface (`notification` is event-driven, so it has none). The previous count of 133
> reconciles exactly: `−2` for the logo pair #106 deleted, `+5` for #106/#108/#109, and
> `+1` for the third metafield owner (see below) that the 136 count missed.
>
> **Out of scope:** the `storefront` context's 8 public page routes (`/`, `/{locale}`,
> `/experiences`, `/policies/{type}`, `/password`, + HEAD/POST). Those are unauthenticated
> HTML rendered in-process by the backend — nothing for this SPA to call.

Frontend call surface: `lib/api.ts` (client + interceptors), `auth/AuthProvider.tsx`, each
module's `hooks/`, plus the two generic readers — `shared/components/useDataTable` (every
cursor-paginated list) and `hooks/use-all-pages` (drain-all-pages pickers).

---

## Coverage: 137 / 137 consumed

| Context | Endpoints | Consumed | Open |
|---|---:|---:|---:|
| `identity` — `/auth/**` + `/ui-languages` | 14 | 14 | — |
| `reference` — timezones · currencies · languages | 3 | 3 | — |
| `touroperator` | 40 | 40 | — |
| `audience` — CRUD + translations | 8 | 8 | — |
| `experience` — CRUD/publish + translations + slots | 16 | 16 | — |
| `pickup` | 5 | 5 | — |
| `audit` | 2 | 2 | — |
| `media` | 5 | 5 | — |
| `page` — CRUD/publish/rename + translations | 12 | 12 | — |
| `metafield` — definitions · owner values (experience · page · **tour operator**) · metaobjects | 29 | 29 | — |
| `contact` | 5 | 5 | — |
| **Total** | **137** | **137** | **—** |

Every admin endpoint has a consumer. The **field-level** gap below is the one
thing this count cannot see, so read it before assuming the surface is complete.

### ✅ Closed since the re-diff

- **`GET`/`PATCH /tour-operators/{id}`** — Settings → General → Shop details. A genuine
  PATCH, unlike most writes here: absent leaves a field unchanged and a **blank string
  clears** an optional one, so the form sends all six fields and keeps empty as `""`.
  `handle` is displayed read-only — it is the storefront subdomain. Changing the timezone
  is confirmed first: stored departures keep their wall-clock time and silently mean a
  different instant, and nothing rewrites them.

- **The two dead calls are gone.** `use-operator-logo.ts` called `PUT`/`DELETE .../logo`,
  which #106 had deleted; Settings → General now uses `AppOperatorBrandCard` against
  `GET`/`PUT /brand`. **`PUT /brand` is a full replace** — `readColors` yields an empty list
  for an absent `colors` — so every write echoes the whole row. The palette and social
  links are read and re-sent untouched; editing them is a later slice.
- **`PATCH /media/{mediaId}`** — alt text, via `AppMediaAltDialog`. `MediaAsset` gained
  `alt`, `width` and `height`, which `MediaResponse` had been returning unread.

Owner-scoped metafield values are one generic path in
`metafields/hooks/use-owner-metafields.ts`. All **three** owner types are wired:
`experiences/{id}/metafields` and `pages/{id}/metafields` from the two detail pages, and
`tour_operator` from Settings → General.

> The operator is the exception in that path: it **is** the owner, so its endpoint is
> `…/{tourOperatorId}/metafields` with no id segment of its own. `ownerTypeLabel` and the
> collection lookup are both `Record`s keyed by the owner code rather than ternaries — the
> third type was previously routed at `pages` by a `? :` fallback that could not fail.

---

## ✅ Operator translations — shipped (2026-08-06)

Settings → **Translations** (`/settings/translations`), built on the per-locale editor shape
the page and experience translations already use: `AppLocaleTabs` over a per-locale form,
keyed by locale so it reseeds on switch. `AppNameTranslations` was the wrong shape — it is
single-field (`name`) and this overlay has five.

- [x] `GET /tour-operators/{id}/translations` — locales that carry an overlay (member)
- [x] `GET /tour-operators/{id}/translations/{locale}` — one overlay (member)
- [x] `PUT /tour-operators/{id}/translations/{locale}` — create/replace (ADMIN+)
- [x] `DELETE /tour-operators/{id}/translations/{locale}` — drop the locale (ADMIN+)

> ⚠️ **`PUT` is a full replace, not a patch.** The backend rebuilds the row from the body,
> so an omitted field is a *cleared* field. The form seeds `defaultValues` from the fetched
> overlay and submits all five every time — that is what keeps an untouched field intact,
> not an accident of the form library.

**The SPA is ahead of merged `main` by two fields, deliberately.** `slogan` and
`shortDescription` land on this endpoint in backend **PR #103**, which is still open;
`main` (`3f7685e`) serves a 3-field payload. Verified against the running backend: a
5-field `PUT` returns **204** and the two unknown fields are silently ignored (Spring Boot
disables Jackson's `FAIL_ON_UNKNOWN_PROPERTIES`), and the `GET` simply omits them, so the
form seeds them empty. The two inputs are therefore inert until #103 merges, at which point
they start working with **no frontend change**. Nothing to undo here — just re-verify after
that merge.

---

## ✅ The field-level gap is closed (2026-08-13)

`ExperienceRequest` accepted `seoTitle`/`seoDescription` while `ExperienceResponse` never
returned them, so the admin could not seed a form field from either — and because the
backend maps blank-or-absent to `null`, **every experience edit cleared both**, including a
value set anywhere else.

Backend **#145** returns the pair *at both levels* — `ExperienceResponse` and
`ExperienceTranslationResponse` — and the frontend now reads, edits and re-sends it at both:
the experience form and the per-locale overlay each carry the two fields.

The overlay is the one that bites quietly, and it is pinned by a test for the same reason
the localized `handle` is: **the translation PUT is a full replace**, so a payload missing a
field clears it rather than leaving it alone. Mutation-checked — dropping the pair from the
translation schema fails `carries the SEO pair`, and dropping it from the canonical schema
fails typecheck, because the form field then has nothing to bind.

Everything else checked in the same pass still matches — `UpdatePageRequest`,
`CreatePageRequest`, `UpdateMetafieldDefinitionRequest`, `UpdateMetaobjectDefinitionRequest`
and `UpdateMetaobjectRequest` against their forms, and every validation bound against its
backend value object (experience name 200, long description 10 000, page title 255, body
262 144, SEO title 70, SEO description 320).

---

## Previously closed

**Backend #105 added eight** (`/policies` ×5 + `/policies/{id}/translations` ×3) and they
landed together as the `policies` module — Content → Policies. Two things about that surface
are worth carrying forward: a policy's **type is its storefront address**, so it is chosen at
create and the update endpoint has no field for it; and its translations have **no per-locale
GET**, so the editor seeds each locale's form from the list the switcher already needs.

Before that, `GET`/`PUT /tour-operators/{id}/seo` landed as **Settings → General → Search
engine listing**, the canonical text that Settings → Translations overlays per locale.

Two notes for whoever extends that card:

- **`PUT` is a full replace**, like the translations one: the form always sends all three
  fields, so an `ogImageMediaId` the operator never touched rides along instead of being
  cleared.
- **The og:image uploads rather than picking from the library.** `AppMediaPicker` would be
  the natural control, but `media` imports `#/tour-operator`, so importing it back through
  this module's barrel is a cycle — verified: it produces 6 `no-circular` errors. The card
  therefore uses the same raw two-step the logo card does (multipart POST → `Location` → id),
  and resolves the preview with a direct `GET .../media/{id}`.

When the backend adds an endpoint, re-run the diff. The mechanical version: enumerate
every `@(Get|Post|Put|Patch|Delete)Mapping` under `presentation/controller`, drop
`storefront`, and match each path against the frontend source — remembering that a call
is often composed (`` `${base}/publish` ``), so a whole-path grep under-reports.
