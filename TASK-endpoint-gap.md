# Endpoint Gap Inventory — backend endpoints not yet used by the frontend

Point-in-time diff of the **backend admin HTTP surface** vs **what the admin frontend
consumes**. Tick an endpoint when a real frontend consumer ships.

> **Snapshot basis:** backend `main` @ `3f7685e` (PR #102, storefront policies), re-diffed
> 2026-08-06. **125 admin endpoints** across the 11 contexts with an admin HTTP surface
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

## Coverage: 123 / 125 consumed

| Context | Endpoints | Consumed | Open |
|---|---:|---:|---:|
| `identity` — `/auth/**` | 13 | 13 | — |
| `identity` — `/ui-languages` | 1 | 1 | — |
| `reference` — timezones · currencies · languages | 3 | 3 | — |
| `touroperator` — create · locales · logo · members · invitations · accept · menus · storefront-password | 24 | 24 | — |
| `touroperator` — translations | 4 | 4 | — |
| `touroperator` — **SEO** | 2 | 0 | **2** |
| `audience` — CRUD + translations | 8 | 8 | — |
| `experience` — CRUD/publish + translations + slots | 16 | 16 | — |
| `pickup` | 5 | 5 | — |
| `audit` | 2 | 2 | — |
| `media` | 4 | 4 | — |
| `page` — CRUD/publish/rename + translations | 12 | 12 | — |
| `metafield` — definitions · owner values · metaobjects | 26 | 26 | — |
| `contact` | 5 | 5 | — |
| **Total** | **125** | **123** | **2** |

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

## ⬜ Not yet used (2)

### `touroperator` — shop SEO
- [ ] `GET /tour-operators/{id}/seo` — `seoTitle` / `seoDescription` / `ogImageMediaId` (member)
- [ ] `PUT /tour-operators/{id}/seo` — replace them (ADMIN+; `ogImageMediaId` validated
      against the operator's own media library)

This is the **canonical** half of what Settings → Translations now overlays: the translation
editor writes per-locale `seoTitle`/`seoDescription`, but nothing authors the default-language
values those fall back to. It belongs beside `AppOperatorLogoCard` in Settings → General, and
`ogImageMediaId` wants the existing `AppMediaPicker`.

Wiring it would also let the translation form show each field's canonical value as a hint,
the way the page and experience translation forms do — today it cannot, and says so in a
comment. The canonical `slogan`/`shortDescription` would still be missing: the brand row is
read-path-only and **no admin endpoint exposes it at all**.

---

## Re-running this diff

```bash
# backend surface (run in ../backend)
grep -rn '@RequestMapping\|@\(Get\|Post\|Put\|Patch\|Delete\)Mapping' \
  src/main/java --include=*Controller.java

# frontend call sites (run here) — note the bases, then the calls
grep -rn 'authApi\.\(get\|post\|put\|patch\|delete\)' src --include=*.ts --include=*.tsx
grep -rn 'endpoint=\|useAllPages' src --include=*.tsx   # the generic list readers
```

The two generic readers are what make a naive `authApi.` grep undercount: a list endpoint
usually appears only as an `endpoint=` prop on an `AppDataTable`.
