import { createFileRoute } from "@tanstack/react-router";
import { AppInvitationDetail } from "#/team";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/invitations/$invitationId",
)({
	component: InvitationDetailPage,
});

// Single-resource page → centered at max-w-3xl (list pages go full width).
function InvitationDetailPage() {
	const { tourOperatorId, invitationId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
			<AppInvitationDetail
				tourOperatorId={tourOperatorId}
				invitationId={invitationId}
			/>
		</div>
	);
}
