import { Spinner } from "#/components/ui/spinner";

// Whatever this returns *is* the prerendered `<body>`: SPA-mode prerendering
// keeps SSR for the root route alone and renders every other match pending.
//
// So it can only use utilities in Vite's first CSS chunk — about half the
// sheet at boot. `text-muted-foreground` is not in it, which is why the spinner
// carries no color class.
export const AppRoutePending = () => (
	<div className="flex min-h-screen items-center justify-center">
		<Spinner className="size-6" />
	</div>
);
