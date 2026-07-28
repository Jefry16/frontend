import { createFileRoute } from "@tanstack/react-router";
import { AppMetaobjectDefinitionDetail } from "#/metaobjects";
import { AppPageShell } from "#/shared/components/AppPageShell";

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
