import { createFileRoute } from "@tanstack/react-router";
import { AppAcceptInvitation } from "#/auth";

// Public — reachable by an anonymous invitee (the emailed token is the
// capability). Deliberately outside the /auth layout (which bounces logged-in
// users) since accept must work for both authenticated and anonymous callers.
export const Route = createFileRoute("/invitations/accept")({
	validateSearch: (search: Record<string, unknown>): { token?: string } => ({
		token: typeof search.token === "string" ? search.token : undefined,
	}),
	component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
	const { token } = Route.useSearch();
	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<AppAcceptInvitation token={token} />
		</div>
	);
}
