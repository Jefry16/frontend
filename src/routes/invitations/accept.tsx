import { createFileRoute } from "@tanstack/react-router";
import { AppAcceptInvitation } from "#/auth";

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
