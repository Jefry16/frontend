# Endpoint Gap Inventory — backend endpoints not yet used by the frontend

Point-in-time diff of the **backend admin HTTP surface** vs **what the admin frontend
consumes**. Tick an endpoint when a real frontend consumer ships.

> **Snapshot basis:** backend `main`, re-diffed **2026-08-14** — **150 admin
> endpoints**, all consumed. The prior 137 count reconciles exactly: `+12` for the
> three metafield-translation controllers and `+1` for `GET /countries`.
> The method, unchanged: enumerate every `@(Get|Post|Put|Patch|Delete)Mapping` under
> `presentation/controller` and match each against the frontend source, across the 11
> contexts with an admin HTTP surface (`notification` is event-driven, so it has none).
>
> **Out of scope:** the `storefront` context's 8 public page routes (`/`, `/{locale}`,
> `/experiences`, `/policies/{type}`, `/password`, + HEAD/POST). Those are unauthenticated
> HTML rendered in-process by the backend — nothing for this SPA to call.

Frontend call surface: `lib/api.ts` (client + interceptors), `auth/AuthProvider.tsx`, each
module's `hooks/`, plus the two generic readers — `shared/components/useDataTable` (every
cursor-paginated list) and `hooks/use-all-pages` (drain-all-pages pickers).

---

## Coverage: 150 / 150 consumed

| Context | Endpoints | Consumed | Open |
|---|---:|---:|---:|
| `identity` — `/auth/**` + `/ui-languages` | 14 | 14 | — |
| `reference` — timezones · currencies · languages · countries | 4 | 4 | — |
| `touroperator` | 40 | 40 | — |
| `audience` — CRUD + translations | 8 | 8 | — |
| `experience` — CRUD/publish + translations + slots | 16 | 16 | — |
| `pickup` | 5 | 5 | — |
| `audit` | 2 | 2 | — |
| `media` | 5 | 5 | — |
| `page` — CRUD/publish/rename + translations | 12 | 12 | — |
| `metafield` — definitions · owner values (experience · page · **tour operator**) · metaobjects · **translations** | 41 | 41 | — |
| `contact` | 5 | 5 | — |
| **Total** | **150** | **150** | **—** |

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

**`slogan` and `shortDescription` are live** (re-verified 2026-08-13). They arrived with
backend #103; the endpoint now returns all five fields and the form has edited them since,
with no frontend change — which is what the SPA being written ahead of the contract bought.

---

## ✅ Verified against the running stack (2026-08-13)

The gaps this file has been carrying as "unit-covered only" are closed. Run against the
seeded `acme` operator; **everything written was restored and checked byte-identical**.

- **`page.published`** — the wire sends the boolean, no `status` field. The seed carries
  mixed state (`Our boats` published, `Press`/`FAQ` not), which is exactly what the old
  `page.status` could not render: before the fix all three showed as Draft.
- **The policy translation legs** — `PUT` 204, a blank body collapsing to `null` rather than
  `""`, an unsupported locale 422, `DELETE` 204 **and idempotent** on a repeat. Restored to
  the baseline of no overlays. A repeat `type` on create 409s, which is the branch the form
  maps to "that policy already exists".
- **The og:image upload** — multipart `POST /media` → 201 + `Location`, `GET /media/{id}`
  resolving a URL with measured dimensions, then `PUT /seo` carrying all three fields. SEO
  restored byte-identical; the probe media row deleted.
- **Role gating, as a real STAFF member** (`diego@acme.test`, seeded). The profile reports
  `STAFF`, so `usePermissions` yields `canWrite: false`. Eight member-level reads answer
  **200** — pages, policies, experiences, media, audiences, contact messages, seo,
  translations — and five ADMIN+ writes answer **403**: `POST /pages`, `POST /policies`,
  `PUT /seo`, `PUT /translations/{locale}`, `PUT /brand`. What the UI hides and what the
  backend refuses now match on evidence rather than on reading the use cases.

**The policy `DELETE` is verified too** (2026-08-13): `204`, **idempotent** on a repeat
(204 again, not 404), `GET` by id then 404s and the list drops to three. Freeing the type
turned `POST TERMS` from **409 into 201**, which is what proves the conflict is genuinely
per-type rather than a coincidence of that row existing.

The record was recreated from a full capture and its `type`, `title` and `body` are
byte-identical. **Its id changed** — the seed uses fixed ids (`…042`) and a recreate mints a
UUIDv7 — so anything pinned to that literal id wants a reseed rather than trusting this row.

---

## ✅ Metafield translations — shipped (2026-08-14)

Backend added three controllers — one per owner type — of four legs each, and
`GET /countries`. That is the **13** the surface grew by (137 → 150); `/countries`
already had a consumer from the address fix, so twelve were open and all twelve
are now wired.

```
GET    …/metafield-translations           → string[]              locales with an overlay (member)
GET    …/metafield-translations/{locale}  → Record<string,string> keyed "namespace.key" (member)
PUT    …/metafield-translations/{locale}  ← { values }  204                          (ADMIN+)
DELETE …/metafield-translations/{locale}                204, idempotent              (ADMIN+)
```

The overlay renders **inside** the three existing translation editors, under the
canonical form, so the operator picks a locale once and translates everything for
it. The tab dot unions both sources — a locale translated only in its metafields
still reads as translated.

> ⚠️ **`PUT` is a patch, not a full replace** — the opposite of every other
> translation endpoint here, and the opposite of what its own controller javadoc
> says (*"Replaces the whole locale in one write"*). **Verified on the wire**, not
> read: writing one key left the untouched key intact. An absent key is left
> alone and a **blank value clears** that key, so the card sends exactly the keys
> the operator edited and an emptied box rides along as `""` — omitting it would
> silently keep the old translation. Pinned by
> `AppMetafieldTranslationsCard.test.tsx` and mutation-checked.

Two more facts that shape the UI, both verified live against seeded `acme` (every
write restored byte-identical):

- **Only `single_line_text` and `multi_line_text` are translatable.** Sending any
  other type **422s** — so the card's type filter is load-bearing, not cosmetic.
  A number or date reads the same everywhere, and pointing a metaobject reference
  elsewhere per locale is content *selection*, a different feature.
- **An unsupported locale 422s**, and `DELETE` is **idempotent** (204 on a repeat).

**The operator owner could not be wired the same way.** `metafields` imports
`#/tour-operator`, so importing it back is a cycle — verified, 6 `no-circular`
errors. The page and experience editors are not on that arc and render the card
inline; for the operator, the *route* composes the two and `AppOperatorTranslations`
takes `alsoTranslated` + `perLocale`. Same trap `media` hit with `AppMediaPicker`.

---

## ⚠️ REST Docs enforce less than they appear to (2026-08-14)

Counting `document(...)` calls says coverage is near-total — **149 calls for 150
endpoints**, and zero `relaxed*`, so any *declared* field table is strict. But a
call with **no** field table documents a name and nothing else:

- **81 body-returning endpoints; 56 carry an enforced field table, 25 do not.**
- **6 of those 25 are legitimately undocumentable** — the metafield-translation
  `get`/`list-locales` return a bare `string[]` and a `Record<string,string>` whose
  keys are operator-defined; strict `fieldWithPath` cannot express that.
- **19 are real gaps.** `slots` is all six of its own, and it is the richest shape
  in the product (nested `audiencePrices`, frozen price/capacity).
- The other 68 documented calls are 204s with no body — correctly no field table.

This is how the controller javadoc above could contradict the use case without
failing a build: the dynamic map has no field table, so nothing checked it.

---

## ✅ Every consumed response shape re-verified (2026-08-14)

All **40** frontend response interfaces diffed field-by-field against the backend's
response records. **Zero drift.** 31 matched by name; 2 flagged and cleared as
name collisions with **storefront** DTOs (`Menu` belongs to `MenuDetailResponse`,
`MetaobjectField` to `MetaobjectDefinitionResponse.FieldResponse`); 7 resolved by
hand as nested or inherited (`MediaAsset`↔`MediaResponse`,
`MenuItemNode`↔`MenuItemResponse`, `OperatorAddress`↔`AddressResponse`,
`SlotAudiencePrice`↔`AudiencePricingResponse`, `AuthUser`↔`ProfileResponse`,
`TourOperatorSummary`↔`TourOperatorMembershipView`, and `MenuItemInput` which is
request-only). The four drifts below were the four that existed.

The pass is a snapshot and decays on the next backend merge — which is the whole
argument for the contract artifact rather than repeating it by hand.

---

## ⚠️ Shape drift is the gap an endpoint count cannot see

An endpoint can be consumed and still be read wrong. **Three instances so far**, all
user-visible, none caught by any gate:

- **`operator.address` became a structured object** (found 2026-08-13, fixed). Backend V15
  replaced the single string with `{address1, address2, city, province, zip, countryId}` and
  a resolved `countryCode`/`countryName` on read. The frontend kept `address: string`, so
  **Settings → General could not save at all** — the flat string answered
  `400 Malformed request body` — the read-only view rendered a plain object as a React
  child, and **onboarding sent the same broken shape**. The fix brings in `GET /countries`
  for the country picker, which had no consumer until now.
- **`page.status` vs `published`** (fixed). Backend `258209a` replaced `String status` with
  `boolean published` on both page responses; the frontend kept `status: PageStatus`, so
  every page rendered as **Draft** and the detail never offered *Unpublish*.
- **The experience SEO pair** (fixed) — see below.

**Why 605 tests stayed green: the fixtures encode the same shape as the types.** Nine
story and test fixtures said `status: "PUBLISHED"`, so every test agreed with the bug.
A frontend type is an unverified claim about the wire, and fixtures written from the type
cannot contradict it.

Nothing in this repo can catch that class today. Re-diffing types against the backend's
response records — as this pass did for eleven of them, finding one mismatch — is the only
check that works, and it is manual. If it recurs, the durable fix is a contract artifact
(the backend already publishes Spring REST Docs snippets) rather than more tests.

Checked in this pass and matching exactly: `Experience`, `Policy`, `Audience`,
`PickupLocation`, `MediaAsset`, `MetafieldDefinition`, `Metaobject`,
`MetaobjectDefinition`, `Member`, `Invitation`, `ContactMessageListItem`, `Slot`.

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
