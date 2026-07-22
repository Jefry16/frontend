# Endpoint Gap Inventory — backend endpoints not yet used by the frontend

Point-in-time diff of **backend HTTP surface** vs **what the rebuilt admin frontend
consumes**. Tick an endpoint when a real frontend consumer ships.

> **Snapshot basis:** current backend HEAD (`14e8fba`, tour-operator-create era) —
> **46 endpoints across 5 contexts** with an HTTP surface: `identity`, `reference`,
> `touroperator`, `media`, `experience` (`notification` is event-driven, no controller).
> This is an *earlier* backend than the auto-memory describes (no `contact`/`theme`/
> `storefront`/`cart`/`booking` in this checkout). **Re-run the diff when the backend
> advances** — see `endpoint-sync-playbook` memory.

Frontend call surface lives in: `lib/api.ts` (client + interceptors), `auth/AuthProvider.tsx`,
`auth/hooks/*`, `auth/verify-token.ts`, `reference/hooks/*`, `tour-operator/hooks/*`.

---

## ✅ Consumed (11)

`POST /auth/register` · `GET /auth/verify` · `POST /auth/login` · `POST /auth/refresh` ·
`POST /auth/logout` · `GET /auth/profile` · `POST /auth/request-password-reset` ·
`POST /auth/reset-password` · `GET /timezones` · `GET /currencies` · `POST /tour-operators`

---

## ⬜ Not yet used (35)

### identity / auth — 5
- [ ] `POST /auth/change-password` — change current user's password (authed)
- [x] ~~`POST /auth/request-password-reset`~~ — forgot/reset slice (done)
- [x] ~~`POST /auth/reset-password`~~ — forgot/reset slice (done)
- [ ] `POST /auth/resend-verification` — resend verification email (public)
- [ ] `POST /auth/profile/avatar` — upload/set avatar, multipart (authed)
- [ ] `DELETE /auth/profile/avatar` — clear avatar (authed)
- [ ] `POST /auth/profile/language` — change UI language (authed)

> ⚠️ `resend-verification` is still pre-listed in `lib/api.ts` `SKIP_AUTH_URLS` but
> **nothing calls it** — scaffolded, not wired.

### reference — 1
- [ ] `GET /languages` — list platform content languages (authed)

### admin UI languages — 1
- [ ] `GET /ui-languages` — list supported admin-UI languages (authed)

### touroperator — 14
**Locales**
- [ ] `GET /tour-operators/{id}/locales` — operator primary + supported locales (member)
- [ ] `PATCH /tour-operators/{id}/locales` — replace content languages (ADMIN+)

**Logo**
- [ ] `PUT /tour-operators/{id}/logo` — set operator logo to media (ADMIN+)
- [ ] `DELETE /tour-operators/{id}/logo` — clear operator logo (ADMIN+)

**Members**
- [ ] `GET /tour-operators/{id}/members` — team roster, paginated (member)
- [ ] `PATCH /tour-operators/{id}/members/{userId}` — change role / transfer ownership (ADMIN+/OWNER)
- [ ] `DELETE /tour-operators/{id}/members/{userId}` — remove member / self-leave (member/ADMIN+)

**Invitations — operator side**
- [ ] `GET /tour-operators/{id}/invitations` — list invitations, paginated (member)
- [ ] `POST /tour-operators/{id}/invitations` — invite a member (ADMIN+)
- [ ] `GET /tour-operators/{id}/invitations/{invitationId}` — get one invitation (member)
- [ ] `POST /tour-operators/{id}/invitations/{invitationId}/resend` — re-issue + resend (ADMIN+)
- [ ] `DELETE /tour-operators/{id}/invitations/{invitationId}` — revoke pending (ADMIN+)

**Invitations — invitee side** (public, token)
- [ ] `GET /invitations/{token}/preview` — preview invitation by token
- [ ] `POST /invitations/{token}/accept` — accept (auto-login if new)

### media — 4  (all under `/tour-operators/{id}/media`)
- [ ] `POST …/media` — upload a media file, multipart (ADMIN+)
- [ ] `GET …/media` — list media library, paginated (member)
- [ ] `GET …/media/{mediaId}` — get a single media record (member)
- [ ] `DELETE …/media/{mediaId}` — delete media, row + object (ADMIN+)

### experience — 10  (all under `/tour-operators/{id}/experiences`)
- [ ] `GET …/experiences` — list, cursor-paginated (member)
- [ ] `GET …/experiences/{experienceId}` — get one (member)
- [ ] `POST …/experiences` — create DRAFT (ADMIN+)
- [ ] `PATCH …/experiences/{experienceId}` — update editable fields (ADMIN+)
- [ ] `POST …/experiences/{experienceId}/publish` — DRAFT → PUBLISHED (ADMIN+)
- [ ] `POST …/experiences/{experienceId}/unpublish` — PUBLISHED → DRAFT (ADMIN+)
- [ ] `GET …/experiences/{experienceId}/translations` — list translated locales (member)
- [ ] `GET …/experiences/{experienceId}/translations/{locale}` — get one overlay (member)
- [ ] `PUT …/experiences/{experienceId}/translations/{locale}` — create/replace overlay (ADMIN+)
- [ ] `DELETE …/experiences/{experienceId}/translations/{locale}` — delete overlay (ADMIN+)

---

## Suggested slice grouping
1. **Auth completion** — forgot/reset/resend-verification + change-password.
2. **Account/profile** — avatar (upload + clear) + UI-language picker (`GET /ui-languages`).
3. **Team space** — members + operator-side invitations + the public accept page (`/invitations/{token}/*`).
4. **Experiences** — CRUD + publish/unpublish + translations (largest; pulls in `GET /languages`).
5. **Media** — library (list/upload/delete) + wire logo (`PUT/DELETE …/logo`) & locales into operator settings.
