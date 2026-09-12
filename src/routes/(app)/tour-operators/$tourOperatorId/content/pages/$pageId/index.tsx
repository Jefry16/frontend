import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppPageDetail } from "#/pages";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/pages/$pageId/",
)({
	component: PageDetailPage,
});

function PageDetailPage() {
	const { tourOperatorId, pageId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppPageDetail tourOperatorId={tourOperatorId} pageId={pageId} />
		</AppPageShell>
	);
}
