import { createFileRoute } from "@tanstack/react-router";
import { AppInviteMemberForm } from "#/team";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/members/new",
)({
	component: InviteMemberPage,
});

function InviteMemberPage() {
	const { tourOperatorId } = Route.useParams();
	return <AppInviteMemberForm tourOperatorId={tourOperatorId} />;
}
