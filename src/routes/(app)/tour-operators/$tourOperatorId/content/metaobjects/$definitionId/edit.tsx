import { createFileRoute } from "@tanstack/react-router";
import { AppMetaobjectDefinitionEdit } from "#/metaobjects";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metaobjects/$definitionId/edit",
)({
	component: MetaobjectDefinitionEditPage,
});

function MetaobjectDefinitionEditPage() {
	const { tourOperatorId, definitionId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppMetaobjectDefinitionEdit
				tourOperatorId={tourOperatorId}
				definitionId={definitionId}
			/>
		</AppPageShell>
	);
}
