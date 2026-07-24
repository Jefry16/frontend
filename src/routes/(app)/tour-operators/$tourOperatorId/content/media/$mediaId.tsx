import { createFileRoute } from "@tanstack/react-router";
import { AppMediaDetail } from "#/media";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/media/$mediaId",
)({
	component: MediaDetailPage,
});

// Single-resource page → centered at max-w-3xl (list pages go full width).
function MediaDetailPage() {
	const { tourOperatorId, mediaId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
			<AppMediaDetail tourOperatorId={tourOperatorId} mediaId={mediaId} />
		</div>
	);
}
