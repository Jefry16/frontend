# Flows

What a person must be able to do with this app, start to finish. This is the
frontend's unit of work and its source of "supposed to": a screen exists to
complete one of these, and a backend endpoint is consumed because one of these
needs it. The backend's `ENDPOINTS.md` is the completeness check the other way
round: every admin endpoint there appears in at least one flow here.

`[x]` marks a flow that has been through a flow-round: walked against a live
backend as the role named, every step landing on the endpoint it names, the
gaps below closed, and the round's PR merged. Nothing is checked yet.

Endpoints are relative to `/api`. The customer-facing storefront is out of
scope: these flows end at the admin app's own screens.

## Getting in

- [x] **F1 Register and sign in.** Anyone.
  1. Register → `POST /auth/register`
  2. Open the verification link → `GET /auth/verify`; ask for another → `POST /auth/resend-verification`
  3. Sign in → `POST /auth/login`; stay signed in across a reload → `POST /auth/refresh`
  4. Sign out → `POST /auth/logout`

- [x] **F2 Recover a password.** Anyone.
  1. Ask for a reset → `POST /auth/request-password-reset`
  2. Set the new one from the link → `POST /auth/reset-password`
  3. Sign in with it → `POST /auth/login`

- [x] **F3 Manage my own account.** Any member.
  1. See who I am → `GET /auth/profile`
  2. Change my avatar → `POST` / `DELETE /auth/profile/avatar`
  3. Change the app language → `GET /ui-languages`, `POST /auth/profile/language`
  4. Change my password → `POST /auth/change-password`

- [x] **F4 Join an operator I was invited to.** Anyone with a link.
  1. See what I was invited to → `GET /invitations/{token}/preview`
  2. Accept, as an existing user or by creating one → `POST /invitations/{token}/accept`
  3. Land inside that operator → `GET /tour-operators/{id}`

## Setting up an operator

- [ ] **F5 Create an operator.** A signed-in user.
  1. Fill in the name, timezone and currency → `GET /timezones`, `GET /currencies`
  2. Create it → `POST /tour-operators`
  3. Land on its dashboard → `GET /tour-operators/{id}`

- [ ] **F6 Fill in the operator's details and brand.** Admin.
  1. Details, address, contact → `PATCH /tour-operators/{id}` (one section per save, whole-replace)
  2. Logo and favicon → `POST /tour-operators/{id}/media`, then the brand section
  3. Colours, social links, SEO defaults, storefront password → the same `PATCH`, one section each

- [ ] **F7 Choose the storefront's languages and translate the operator.** Admin.
  1. Pick a primary and supported locales → `GET /languages`, `PATCH /tour-operators/{id}` (locales section)
  2. Translate the operator's own texts per locale → `GET /tour-operators/{id}/translations`, `GET` / `PUT` / `DELETE /tour-operators/{id}/translations/{locale}`

- [ ] **F8 Publish the policies.** Admin.
  1. Write one → `POST /tour-operators/{id}/policies`; read it back → `GET .../policies/{policyId}`
  2. Change or remove it → `PUT` / `DELETE .../policies/{policyId}`
  3. Translate it → `GET .../policies/{policyId}/translations`, `PUT` / `DELETE .../translations/{locale}`
  - Gap: the policies list screen calls `GET .../policies`, which the backend does not serve. Either the list is read from somewhere else or the backend grows the endpoint; the round decides with the backend.

- [ ] **F9 Build the storefront menu.** Admin.
  1. Create a menu and its items → `GET` / `POST /tour-operators/{id}/menus`, `GET` / `PATCH` / `DELETE .../menus/{menuId}`
  2. Link an item to the home page, the experience list, one experience, one category, one page, or a URL
  - Gap: the `HOME` and `CATEGORY` link types exist on the backend and not here.
  - Gap: item saves go to `PUT .../menus/{menuId}/items`, which does not exist; items are part of the menu `PATCH`.

## Building the catalogue

- [ ] **F10 Manage the media library.** Admin.
  1. Upload → `POST /tour-operators/{id}/media`; browse → `GET .../media`
  2. Describe one for accessibility → `GET` / `PATCH .../media/{mediaId}`
  3. Delete one → `DELETE .../media/{mediaId}`

- [ ] **F11 Define who can book.** Admin.
  1. Audiences (adult, child, …) → `GET` / `POST /tour-operators/{id}/audiences`, `GET` / `PATCH .../audiences/{audienceId}`
  2. Translate their names → `GET .../audiences/{audienceId}/translations`, `GET` / `PUT` / `DELETE .../translations/{locale}`

- [ ] **F12 Define where to pick people up.** Admin.
  1. Pickup locations → `GET` / `POST /tour-operators/{id}/pickup-locations`, `GET` / `PATCH` / `DELETE .../pickup-locations/{pickupLocationId}`

- [ ] **F13 Group experiences into categories.** Admin.
  1. Categories → `GET` / `POST /tour-operators/{id}/categories`, `GET` / `PATCH` / `DELETE .../categories/{categoryId}` (the handle never changes)
  2. Translate their names → `GET .../categories/{categoryId}/translations`, `GET` / `PUT` / `DELETE .../translations/{locale}`

- [ ] **F14 Create and publish an experience.** Admin.
  1. Create it → `POST /tour-operators/{id}/experiences`; edit it → `GET` / `PATCH .../experiences/{experienceId}`
  2. Pick its images from the library (F10) and its category (F13)
  3. Fill in its custom fields (F15) → `GET` / `PUT .../metafields/experience/{experienceId}`
  4. Translate it → `GET .../experiences/{experienceId}/translations`, `GET` / `PUT` / `DELETE .../translations/{locale}`, and its custom fields → `.../metafield-translations/experience/{experienceId}[/{locale}]`
  5. Publish it → `PUT .../experiences/{experienceId}/published`
  - Gap: the experience form has no category picker; the backend stores `categoryId` and nothing here sends it.

- [ ] **F15 Add custom fields to experiences, pages and the operator.** Admin.
  1. Define a field → `GET` / `POST /tour-operators/{id}/metafield-definitions`, `GET` / `PUT` / `DELETE .../metafield-definitions/{definitionId}`
  2. Fill it on an owner → `GET` / `PUT .../metafields/{ownerType}/{ownerId}` (a `PUT` merges; a blank clears)
  3. Translate the value → `GET .../metafield-translations/{ownerType}/{ownerId}`, `GET` / `PUT` / `DELETE .../{locale}`

- [ ] **F16 Model structured content.** Admin.
  1. Define a type and its fields → `GET` / `POST /tour-operators/{id}/metaobject-definitions`, `GET` / `PUT` / `DELETE .../metaobject-definitions/{definitionId}`, `POST .../fields`, `PATCH` / `DELETE .../fields/{key}`
  2. Create entries → `GET` / `POST .../metaobjects`, `GET` / `PATCH` / `DELETE .../metaobjects/{metaobjectId}`
  3. Publish an entry → `PUT .../metaobjects/{metaobjectId}/published`
  4. Reference an entry from a custom field (F15)
  5. Translate an entry's fields → `GET .../metaobjects/{metaobjectId}/field-translations`, `GET` / `PUT` / `DELETE .../field-translations/{locale}`
  - Gap: step 5 has no screen; the four endpoints have no consumer.

- [ ] **F17 Write and publish a page.** Admin.
  1. Create it → `POST /tour-operators/{id}/pages`; edit it → `GET` / `PATCH .../pages/{pageId}`; list them → `GET .../pages`
  2. Change its address → `POST .../pages/{pageId}/rename`
  3. Fill in its custom fields (F15) → `.../metafields/page/{pageId}`
  4. Translate it → `GET .../pages/{pageId}/translations`, `GET` / `PUT` / `DELETE .../translations/{locale}`
  5. Publish it → `PUT .../pages/{pageId}/published`; remove it → `DELETE .../pages/{pageId}`

## Selling

- [ ] **F18 Open availability and manage it.** Admin.
  1. Pick an experience → `GET /tour-operators/{id}/experiences`
  2. Open recurring or one-off slots, priced per audience (F11) → `POST .../experiences/{experienceId}/slots`
  3. See what is open → `GET .../slots`; one slot → `GET .../slots/{slotId}`
  4. Change capacity → `PATCH .../slots/{slotId}`; cancel → `POST .../slots/{slotId}/cancel`
  - Gap: the one-off form posts to a singular `.../slot`, which does not exist.

## Running the business

- [ ] **F19 Read messages from customers.** Any member.
  1. Inbox → `GET /tour-operators/{id}/contact-messages`, `GET .../contact-messages/{messageId}`

- [ ] **F20 See what changed and who did it.** Any member.
  1. The log → `GET /tour-operators/{id}/audit-log`; one entry with its diff → `GET .../audit-log/{entryId}`
  2. The same log filtered to one record, on that record's page

- [ ] **F21 Run the team.** Admin; and a viewer, to prove read-only holds.
  1. Invite → `GET` / `POST /tour-operators/{id}/invitations`, `GET` / `DELETE .../invitations/{invitationId}`, `POST .../resend`
  2. Members and roles → `GET .../members`, `GET` / `PATCH` / `DELETE .../members/{userId}`
  3. Signed in as a viewer, every write control in F6 to F18 is absent and every write request is refused → `403`
