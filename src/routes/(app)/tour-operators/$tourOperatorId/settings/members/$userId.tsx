import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { AppMemberDetail } from "#/team";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/members/$userId",
)({
	component: MemberDetailPage,
});

function MemberDetailPage() {
	const { tourOperatorId, userId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppMemberDetail tourOperatorId={tourOperatorId} userId={userId} />
		</AppPageShell>
	);
}
