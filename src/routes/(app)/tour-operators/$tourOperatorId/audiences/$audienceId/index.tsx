import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppAudienceDetail } from "#/audiences";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/audiences/$audienceId/",
)({
	component: AudienceDetailPage,
});

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
