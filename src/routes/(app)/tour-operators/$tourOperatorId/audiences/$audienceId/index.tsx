import { createFileRoute } from "@tanstack/react-router";
import { AppAudienceDetail } from "#/audiences";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/audiences/$audienceId/",
)({
	component: AudienceDetailPage,
});

// Single-resource page → centered at max-w-3xl (list pages go full width).
function AudienceDetailPage() {
	const { tourOperatorId, audienceId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppAudienceDetail
				tourOperatorId={tourOperatorId}
				audienceId={audienceId}
			/>
		</AppPageShell>
	);
}
