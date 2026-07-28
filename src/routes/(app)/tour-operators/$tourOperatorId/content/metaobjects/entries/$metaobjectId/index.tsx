import { createFileRoute } from "@tanstack/react-router";
import { AppMetaobjectDetail } from "#/metaobjects";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metaobjects/entries/$metaobjectId/",
)({
	component: MetaobjectDetailPage,
});

// Static "entries" wins over the dynamic $definitionId sibling; the flat
// entry path keeps the audit table's entity links single-param.
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
