import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppMetaobjectDetail } from "#/metaobjects";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metaobjects/entries/$metaobjectId/",
)({
	component: MetaobjectDetailPage,
});

function MetaobjectDetailPage() {
	const { tourOperatorId, metaobjectId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppMetaobjectDetail
				tourOperatorId={tourOperatorId}
				metaobjectId={metaobjectId}
			/>
		</AppPageShell>
	);
}
