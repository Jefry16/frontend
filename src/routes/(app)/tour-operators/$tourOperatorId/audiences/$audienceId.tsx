import { createFileRoute } from "@tanstack/react-router";
import { AppAudienceDetail } from "#/audiences";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/audiences/$audienceId",
)({
	component: AudienceDetailPage,
});

// Single-resource page → centered at max-w-3xl (list pages go full width).
function AudienceDetailPage() {
	const { tourOperatorId, audienceId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
			<AppAudienceDetail
				tourOperatorId={tourOperatorId}
				audienceId={audienceId}
			/>
		</div>
	);
}
