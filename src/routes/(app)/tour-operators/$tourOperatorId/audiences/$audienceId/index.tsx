import { createFileRoute } from "@tanstack/react-router";
import { AppAudienceDetail } from "#/audiences";
import { AppPageShell } from "#/shared/components/AppPageShell";

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
