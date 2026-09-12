import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppMetaobjectDefinitionDetail } from "#/metaobjects";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metaobjects/$definitionId/",
)({
	component: MetaobjectDefinitionDetailPage,
});

function MetaobjectDefinitionDetailPage() {
	const { tourOperatorId, definitionId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppMetaobjectDefinitionDetail
				tourOperatorId={tourOperatorId}
				definitionId={definitionId}
			/>
		</AppPageShell>
	);
}
