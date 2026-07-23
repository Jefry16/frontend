import { createFileRoute } from "@tanstack/react-router";
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
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
			<AppMemberDetail tourOperatorId={tourOperatorId} userId={userId} />
		</div>
	);
}
