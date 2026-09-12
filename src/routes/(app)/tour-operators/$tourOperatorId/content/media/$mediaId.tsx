import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppMediaDetail } from "#/media";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/media/$mediaId",
)({
	component: MediaDetailPage,
});

function MediaDetailPage() {
	const { tourOperatorId, mediaId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppMediaDetail tourOperatorId={tourOperatorId} mediaId={mediaId} />
		</AppPageShell>
	);
}
