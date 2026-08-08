# Endpoint Gap Inventory — backend endpoints not yet used by the frontend

Point-in-time diff of the **backend admin HTTP surface** vs **what the admin frontend
consumes**. Tick an endpoint when a real frontend consumer ships.

> **Snapshot basis:** backend `main` @ `3f7685e` (PR #102, storefront policies), re-diffed
> re-diffed 2026-08-08 after backend #105. **133 admin endpoints** across the 11 contexts with an admin HTTP surface
> (`notification` is event-driven, so it has none). The open PR #103 branch adds **no
> endpoint** — it widens the payload of an existing one (see the gap list).
>
> **Out of scope:** the `storefront` context's 8 public page routes (`/`, `/{locale}`,
> `/experiences`, `/policies/{type}`, `/password`, + HEAD/POST). Those are unauthenticated
> HTML rendered in-process by the backend — nothing for this SPA to call.

Frontend call surface: `lib/api.ts` (client + interceptors), `auth/AuthProvider.tsx`, each
module's `hooks/`, plus the two generic readers — `shared/components/useDataTable` (every
cursor-paginated list) and `hooks/use-all-pages` (drain-all-pages pickers).

---

## Coverage: 133 / 133 consumed

| Context | Endpoints | Consumed | Open |
|---|---:|---:|---:|
| `identity` — `/auth/**` | 13 | 13 | — |
| `identity` — `/ui-languages` | 1 | 1 | — |
| `reference` — timezones · currencies · languages | 3 | 3 | — |
| `touroperator` — create · locales · logo · members · invitations · accept · menus · storefront-password | 24 | 24 | — |
| `touroperator` — translations | 4 | 4 | — |
| `touroperator` — SEO | 2 | 2 | — |
| `audience` — CRUD + translations | 8 | 8 | — |
| `experience` — CRUD/publish + translations + slots | 16 | 16 | — |
| `pickup` | 5 | 5 | — |
| `audit` | 2 | 2 | — |
| `media` | 4 | 4 | — |
| `page` — CRUD/publish/rename + translations | 12 | 12 | — |
| `metafield` — definitions · owner values · metaobjects | 26 | 26 | — |
| `contact` | 5 | 5 | — |
| `touroperator` — policies + policy translations | 8 | 8 | — |
| **Total** | **133** | **133** | **—** |

Owner-scoped metafield values are one generic path in
`metafields/hooks/use-owner-metafields.ts` — both owner types (`experiences/{id}/metafields`
and `pages/{id}/metafields`) are wired, from `AppExperienceDetail` and `AppPageDetail`.

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

## ✅ Nothing left

Every admin endpoint the backend exposes has a frontend consumer.

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

When the backend adds an endpoint, re-run the diff below.
