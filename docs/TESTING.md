# Testing — What to test, and how we know it works

Prescriptive, like [`COMPONENTS.md`](./COMPONENTS.md). It answers two questions:
**which code earns a test**, and **how we tell a real test from one that only
looks like one**.

Pairs with the five gates in [`../CLAUDE.md`](../CLAUDE.md). Those cover
structure; this covers behaviour.

---

## 1. The rule

> **Write a test when the gate can't see it and the screen won't show it.**

Everything else is already covered by something cheaper. `tsc` catches shapes,
`depcheck` catches boundaries, Biome catches style, `token-drift` catches ad-hoc
CSS, `story-coverage` catches a missing story, `form-pattern` catches a raw
input in a form. 151 stories cover how things look.

What none of them can see is a mutation that succeeds and leaves the screen
looking right. That is the whole target.

## 2. Tiers

**Tier 1 — always test.** A bug here throws no error, logs nothing, and renders
normally. The operator finds it; you don't.

| Kind | Why it is silent |
|---|---|
| Cache invalidation (`use-*-actions`) | A wrong query key still typechecks, still sends the right request, still resolves. The screen keeps showing the row the operator just changed. |
| Session and refresh (`lib/api.ts`) | Concurrent refreshes race a rotating token; the symptom is a random logout under load, unreproducible by hand. |
| Pagination (`use-all-pages`) | Stopping early leaves a skeleton that never resolves — not an error, so nothing surfaces and nothing retries. |
| Request payload shaping (`use-*-form`) | A wrong field name is accepted and ignored, or silently clears a column. |
| Date and time arithmetic | Off-by-one-day is invisible until someone reads a booking. |

**Tier 2 — test when there is real logic.** A validator with conditional rules
(a resource link needs a target, an external link needs a URL), a formatter with
a fallback path. Not a validator that only restates a zod builder.

**Tier 3 — do not test.** Markup, one-line `useResource` reads, `queryKeys`
entries, thin wrappers over a library call. A test here asserts that the library
works.

## 3. A test is not real until it fails

**Mutate the source, run the suite, restore.** If it still passes, the test is
theatre — delete it or fix it.

This is not a formality. Three tests written during the sweep that produced this
document passed against **deliberately broken source**:

- a metaobject payload assertion — the mutation revealed the branch under test
  was unreachable *and* the assertion was empty;
- `AppPageActions`' "a destructive action stays out of the primary slot" — the
  fixture already led with a safe action, so the rule was never exercised;
- `useAllPages`' "stays pending while pages remain" — `waitFor` polls on an
  interval and stepped straight over the offending render.

Coverage counted all three as covered. The mutation caught all three.

Two habits that follow:

- **Assert on every render, not on a sample**, when the claim is about a
  transient state. `waitFor` can miss the render that breaks the rule.
- **Bound the failure you are simulating.** An endpoint that 401s *forever* is
  the honest shape of a retry-loop bug, and it makes the mutated run **hang**
  rather than fail — which in CI costs the job and names nothing. Let it relent
  after N calls so a broken guard overshoots a count and fails in milliseconds.

No Stryker. `sed` and a restore have caught everything so far, and a mutation
harness is a dependency to keep true (LAW §2.4). Add one when something manual
cannot reach.

## 4. Coverage

```bash
pnpm test:coverage      # text summary + coverage/index.html
pnpm test:ui            # browsable run report, watch mode
```

Configured in `vitest.config.ts`, excluding vendored `ui/`, generated output,
stories and tests. **Nothing gates on the number, and nothing should.** A
percentage target buys assertion-free tests that execute lines — exactly the
three above.

Read it as a *map of what is untested*, and read the **shape**, not the score.
The baseline when this document was written:

```
Statements   13.07%   Branches   59.20%   Functions   42.05%
```

Statements are low and branches are high because the tests are aimed at decision
points — hooks, validators, the interceptor — while the untested bulk is JSX. A
single number would read as alarming and mean nothing. If branches ever fall
*below* statements, the suite has started testing rendering instead of logic.

## 5. Mechanics

- `renderWithProviders` / `wrapperWithProviders` from `#/test/test-utils`.
- `renderActions` from `#/test/actions` for a `use-*-actions` hook — it records
  the invalidated keys off a spy on the test `QueryClient`.
- MSW handlers in `src/test/handlers.ts`; an unhandled request **fails** the
  test, so every call needs a handler or a `server.use(...)` override.
- The default handler set has no session: `AuthProvider` refreshes on mount in
  every test that renders it, and the 401 is what resolves that to
  unauthenticated.
- `src/test/a11y.ts` is a floor, not a substitute — it covers structure and is
  blind to whether state is announced.
