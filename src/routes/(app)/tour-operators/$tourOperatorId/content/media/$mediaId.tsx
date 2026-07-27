import { createFileRoute } from "@tanstack/react-router";
import { AppMediaDetail } from "#/media";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/media/$mediaId",
)({
	component: MediaDetailPage,
});

// Single-resource page → centered at max-w-3xl (list pages go full width).
function MediaDetailPage() {
	const { tourOperatorId, mediaId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppMediaDetail tourOperatorId={tourOperatorId} mediaId={mediaId} />
		</AppPageShell>
	);
}
