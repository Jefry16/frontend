import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppInvitationDetail } from "#/team";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/invitations/$invitationId",
)({
	component: InvitationDetailPage,
});

function InvitationDetailPage() {
	const { tourOperatorId, invitationId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppInvitationDetail
				tourOperatorId={tourOperatorId}
				invitationId={invitationId}
			/>
		</AppPageShell>
	);
}
