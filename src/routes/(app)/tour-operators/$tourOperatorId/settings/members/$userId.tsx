import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { AppMemberDetail } from "#/team";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/members/$userId",
)({
	component: MemberDetailPage,
});

// Single-resource page → centered at max-w-3xl (list pages go full width).
function MemberDetailPage() {
	const { tourOperatorId, userId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppMemberDetail tourOperatorId={tourOperatorId} userId={userId} />
		</AppPageShell>
	);
}
