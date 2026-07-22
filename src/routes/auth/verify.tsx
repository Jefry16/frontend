import { createFileRoute } from "@tanstack/react-router";
import { AppVerifyAccount, verifyToken } from "#/auth";

export const Route = createFileRoute("/auth/verify")({
	validateSearch: (search: Record<string, unknown>): { token?: string } => ({
		token: typeof search.token === "string" ? search.token : undefined,
	}),
	loaderDeps: ({ search }) => ({ token: search.token }),
	// Runs once per navigation (no effect double-invoke) — the single-use token
	// is consumed exactly once. Never throws; maps to a UI state.
	loader: ({ deps }) => verifyToken(deps.token),
	pendingComponent: () => <AppVerifyAccount state="verifying" />,
	component: VerifyPage,
});

function VerifyPage() {
	const state = Route.useLoaderData();
	return <AppVerifyAccount state={state} />;
}
