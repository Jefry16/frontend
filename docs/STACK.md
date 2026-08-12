# Stack & Authoritative Docs

The canonical reference for the frontend's dependencies: what each package is, the
version we run, and the **authoritative documentation URL** to consult. Read this
before reaching for an API — we verify against these docs rather than assume. When a
package is upgraded, update the version and re-check the doc link here.

Versions are the **resolved** versions in `node_modules` (2026-08-06). `@tanstack/*`
packages pinned to `latest` in `package.json` are noted with their resolved version, so
they drift on any reinstall — re-read them rather than trusting the number:

```bash
node -p "require('./node_modules/<pkg>/package.json').version"
```

---

## Framework · Routing · SSR shell

| Package | Version | Role | Docs |
|---|---|---|---|
| `react` / `react-dom` | 19.2 | UI runtime | https://react.dev |
| `@tanstack/react-router` | 1.170.18 | file-based routing, the app's navigation spine | https://tanstack.com/router/latest/docs/framework/react/overview |
| `@tanstack/router-plugin` | 1.168.23 | Vite plugin that generates `routeTree.gen.ts` | https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing |
| `@tanstack/react-start` | 1.168.32 | app shell / build; we run **SPA mode** (prerendered shell, no SSR server) | https://tanstack.com/start/latest/docs/framework/react/overview |
| ↳ SPA mode | — | our hosting model (static shell, no SSR server) | https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode |
| ↳ Static prerendering | — | the prerender options passed in `vite.config.ts` | https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering |
| ↳ Hosting | — | what a static host has to serve | https://tanstack.com/start/latest/docs/framework/react/guide/hosting |

## Data · Forms · Validation

| Package | Version | Role | Docs |
|---|---|---|---|
| `@tanstack/react-query` | 5.100.14 | server state (the profile query, mutations) | https://tanstack.com/query/latest/docs/framework/react/overview |
| `@tanstack/react-form` | 1.33.2 | form state (every app form builds on the base `useForm`) | https://tanstack.com/form/latest/docs/framework/react/quick-start |
| `@tanstack/react-table` | 8.21.3 | headless table — drives `AppDataTable` + `useDataTable` | https://tanstack.com/table/latest/docs/introduction |
| `zod` | 4.4.3 | schema validation (form validators mirror backend VOs) — **v4** API | https://zod.dev |
| `axios` | 1.18.1 | HTTP client (`lib/api.ts`, token + 401 refresh interceptors) | https://axios-http.com/docs/intro |

## Styling · UI primitives

| Package | Version | Role | Docs |
|---|---|---|---|
| `tailwindcss` | 4.3.3 | utility CSS — **v4** (CSS-first config, no `tailwind.config.js`) | https://tailwindcss.com/docs |
| ↳ v4 upgrade notes | — | breaking changes vs v3 | https://tailwindcss.com/docs/upgrade-guide |
| `@tailwindcss/vite` | 4.3.3 | the Vite plugin (how Tailwind is wired here) | https://tailwindcss.com/docs/installation/using-vite |
| `shadcn` | 4.13.1 (CLI) | component registry; our style is **`radix-nova`** (see `components.json`) | https://ui.shadcn.com/docs |
| ↳ shadcn CLI | — | `shadcn add` — the ONLY sanctioned way to add/update `components/ui/*` | https://ui.shadcn.com/docs/cli |
| `radix-ui` | 1.6.4 | headless primitives (unified package the shadcn components import) | https://www.radix-ui.com/primitives/docs/overview/introduction |
| `react-day-picker` | 10.0.1 | the date picker behind `components/ui/calendar` + `AppDateField` | https://daypicker.dev |
| `lucide-react` | 0.545 | icon set | https://lucide.dev/guide/packages/lucide-react |
| `sonner` | 2.0.7 | toasts (wrapped by `components/ui/sonner.tsx`) | https://sonner.emilkowal.ski |
| `next-themes` | 0.4.6 | theme signal consumed by the sonner wrapper (our own `ThemeProvider` is custom) | https://github.com/pacocoursey/next-themes |
| `class-variance-authority` | 0.7.1 | variant API (`cva`) used across the primitives | https://cva.style/docs |
| `clsx` | 2.1.1 | class join (inside `cn()`) | https://github.com/lukeed/clsx |
| `tailwind-merge` | 3.6.0 | Tailwind class de-dup (inside `cn()`) | https://github.com/dcastil/tailwind-merge |
| `tw-animate-css` | 1.4.0 | animation utilities imported in `styles.css` | https://github.com/Wombosvideo/tw-animate-css |
| `@fontsource-variable/geist` | 5.3.0 | the Geist variable font | https://fontsource.org/fonts/geist |

## Internationalization

| Package | Version | Role | Docs |
|---|---|---|---|
| `@inlang/paraglide-js` | 2.22.0 | compiler-based i18n (`#/paraglide/*` output) — **v2** | https://inlang.com/m/gerre34r/library-inlang-paraglideJs |
| `@inlang/cli` | 3.2.0 | `inlang machine translate` etc. | https://inlang.com/m/2qj2w8pu/app-inlang-cli |

## Build · Test

| Package | Version | Role | Docs |
|---|---|---|---|
| `vite` | 7.3.6 | bundler / dev server | https://vite.dev |
| `@vitejs/plugin-react` | 5.2.0 | React fast-refresh + JSX | https://github.com/vitejs/vite-plugin-react |
| `vite-tsconfig-paths` | 5.1.4 | resolves the `#/*` path alias | https://github.com/aleclarson/vite-tsconfig-paths |
| `typescript` | 5.9.3 | types | https://www.typescriptlang.org/docs/ |
| `vitest` | 3.2.7 | test runner (jsdom) | https://vitest.dev |
| `@vitest/coverage-v8` | 3.2.7 | coverage provider (`pnpm test:coverage`) | https://vitest.dev/guide/coverage |
| `@vitest/ui` | 3.2.7 | browsable run report (`pnpm test:ui`) | https://vitest.dev/guide/ui |
| `@testing-library/react` | 16.3.2 | component/hook rendering in tests | https://testing-library.com/docs/react-testing-library/intro/ |
| `@testing-library/user-event` | 14.6.1 | user-interaction simulation | https://testing-library.com/docs/user-event/intro/ |
| `@testing-library/jest-dom` | 6.10.0 | DOM matchers | https://github.com/testing-library/jest-dom |
| `axe-core` | 4.13.0 | accessibility rules in tests (`src/test/a11y.ts`) — engine only, no wrapper | https://github.com/dequelabs/axe-core/blob/develop/doc/API.md |
| `msw` | 2.15.0 | network mocking (`src/test/handlers.ts`) | https://mswjs.io/docs |
| `jsdom` | 28.1.0 | the test DOM environment | https://github.com/jsdom/jsdom |
| `@tanstack/react-devtools` + `react-router-devtools` + `devtools-vite` | 0.10.8 / 1.167.0 / 0.8.1 | the dev-only devtools panel mounted in `__root.tsx` | https://tanstack.com/devtools/latest/docs |

## Tooling · Quality gates

| Package | Version | Role | Docs |
|---|---|---|---|
| `@biomejs/biome` | 2.4.5 | lint + format. Run `pnpm check` before a commit; **CI does not run it** (`.github/workflows/deploy.yml` runs typecheck · depcheck · test only) | https://biomejs.dev |
| ↳ config reference | — | `biome.json` options | https://biomejs.dev/reference/configuration/ |
| ↳ lint rules | — | rule names for `biome-ignore` | https://biomejs.dev/linter/rules/ |
| `dependency-cruiser` | 17.4.3 | module-boundary enforcement (`.dependency-cruiser.cjs`) | https://github.com/sverweij/dependency-cruiser |
| ↳ rules reference | — | the rule schema our config uses | https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md |

## Storybook — the living component inventory (150 story files, gated)

| Package | Version | Role | Docs |
|---|---|---|---|
| `storybook` | 10.5.3 | component workshop | https://storybook.js.org/docs |
| `@storybook/tanstack-react` | 10.5.3 | our framework — auto-mocks the TanStack Router context in stories | https://storybook.js.org/docs/get-started/frameworks/tanstack-react |
| `@storybook/addon-a11y` | 10.5.3 | accessibility checks panel | https://storybook.js.org/docs/writing-tests/accessibility-testing |
| `@storybook/addon-docs` | 10.5.3 | autodocs | https://storybook.js.org/docs/writing-docs |

---

## Notes that override assumptions

- **Zod is v4**, not v3 — `z.email()` is a top-level format, schemas are Standard Schema
  (so they plug into TanStack Form validators directly).
- **Tailwind is v4** — configuration is CSS-first in `src/styles.css` (`@theme`,
  `@custom-variant`), there is **no** `tailwind.config.js`.
- **TanStack Start runs in SPA mode** — there is no SSR server; the build prerenders a
  static shell. Server-function examples in the docs don't apply to us.
- **Paraglide is v2** — the Vite plugin auto-compiles; `#/paraglide/*` is generated
  (gitignored). `getLocale()`/`setLocale()`/`locales` come from `#/paraglide/runtime`.
- **`components/ui/*` is shadcn (radix-nova style)** — change it only via `shadcn add`
  or a deliberate, noted patch; never hand-fork silently.
- **`@storybook/tanstack-react`** wraps every story in a memory-backed TanStack Router,
  so stories get router context without booting the app shell.
- **`@vitest/ui` must track `vitest`'s major.** `pnpm add -D @vitest/ui` resolves to
  **4.x** while the runner here is **3.2.7**, and pnpm reports it only as an unmet peer
  — an install that looks like it worked. Pin the range (`@vitest/ui@^3.2.4`) whenever
  either is touched, and bump the two together.
- **axe in jsdom is a floor, not a verdict.** Rules needing layout cannot run: jsdom
  reports `scrollHeight`/`clientHeight` as 0, so `scrollable-region-focusable` comes back
  *inapplicable* rather than failing, and `color-contrast` is disabled outright in
  `src/test/a11y.ts`. axe also has no rule for a missing `aria-sort` or `aria-current`,
  or for many controls sharing one name — those are announcement gaps, not violations.
  Measured against the five a11y bugs found by hand, axe catches one. Keep the targeted
  tests (`AppDataTable.test.tsx`, `SidebarNavLeaf.test.tsx`) for the other half.
- **"Can't perform a React state update on a component that hasn't mounted yet" is
  dev-only, and it is not `theme.tsx`.** The string lives solely in react-dom's
  `.development.js` (`warnAboutUpdateOnNotYetMountedFiberInDEV`), so it cannot reach a
  production build, and React dedupes it to **once per component name per page load**.
  It was reported once against `theme.tsx:94` — which is the file's closing `};`, an
  end-of-module sourcemap artifact, not a statement that can set state — with the frame
  above it in React DevTools' `installHook.js`, which only patches `console.error`.
  Chased to a conclusion on 2026-08-09 and **not reproducible**: 20 loads of the reported
  URL under a real login — clean, 8× CPU throttle, 400 ms/200 kbps network, dark preset,
  SPA navigation, and with the same React DevTools 7.0.1 extension loaded and verified
  attached (`renderers=1`, `console.error` patched). Zero occurrences, and no non-network
  console output at all. `next-themes`' `useTheme` is `useContext(x) ?? default` — no
  state, ruled out — and `src/` has no render-phase `setState` and no promise started in
  render. If it resurfaces, capture React's **component stack** (the name React puts in
  the warning), not the JS frame; the JS frame is the console interceptor.
- **`next-themes` is a phantom dependency, and that is fine.** Vendored
  `components/ui/sonner.tsx` imports `useTheme` from it, and no `next-themes` provider is
  mounted — `__root.tsx`'s `ThemedToaster` passes `theme` explicitly *after* `{...props}`,
  so ours wins. Editing the file would break the shadcn-identical rule for no gain: its
  `ThemeProvider` tree-shakes away completely (`disableTransitionOnChange` appears 0 times
  in `dist`), leaving only a context read.
- **The prerendered SPA shell is the router's pending fallback, and it gets a
  partial stylesheet.** In SPA mode router-core keeps SSR for the root route
  alone and renders every other match in its *pending* state, so whatever
  `defaultPendingComponent` returns is the entire body of `dist/client/index.html`
  — with none configured it was empty, and a cold load was blank white until the
  bundle booted (~2.5 s on Fast 3G, measured). `AppRoutePending` fills it. Two
  traps for anything else put in that shell: Vite code-splits the CSS, so at boot
  only the first chunk exists (~104 of ~200 rules — layout utilities yes,
  `text-muted-foreground` no, so colours fall back to `--foreground`); and
  `defaultPendingMs` is **1000**, so the same component is what an in-app
  transition shows after a second of stalling.
