import { Spinner } from "#/components/ui/spinner";

// The router's default pending fallback — and, in SPA mode, the only thing on
// screen between first byte and hydration.
//
// Prerendering a shell renders every non-root match in its *pending* state
// (router-core's `isShell()` branch keeps SSR for the root route alone), so
// whatever this returns is what lands in the prerendered `index.html`. With no
// `defaultPendingComponent` configured, that body held nothing but React's
// suspense markers and a cold load was a blank white page until the bundle
// booted — measured at ~2.5s on Fast 3G.
//
// In practice it renders nowhere else: no route has an async loader (the one
// that does, `auth/verify`, brings its own `pendingComponent`), and
// `defaultPendingMs` is 1000, so an in-app transition would have to stall for a
// second to reach it. Data loads through TanStack Query inside components,
// which have their own skeletons.
// No `text-muted-foreground` here, deliberately: Vite splits the CSS, and at
// boot only the first chunk has arrived (104 rules of ~200 — enough for the
// centering, not for that utility). The spinner would inherit `--foreground`
// anyway during the one window this renders, so the class would be decoration
// that never takes effect. Anything else added to the prerendered shell is
// under the same constraint.
export const AppRoutePending = () => (
	<div className="flex min-h-screen items-center justify-center">
		<Spinner className="size-6" />
	</div>
);
