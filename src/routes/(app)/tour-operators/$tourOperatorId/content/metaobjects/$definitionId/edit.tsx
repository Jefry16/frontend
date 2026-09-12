import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppMetaobjectDefinitionEdit } from "#/metaobjects";
import { AppWriteGate } from "#/session";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metaobjects/$definitionId/edit",
)({
	component: MetaobjectDefinitionEditPage,
});

function MetaobjectDefinitionEditPage() {
	const { tourOperatorId, definitionId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
				<AppMetaobjectDefinitionEdit
					tourOperatorId={tourOperatorId}
					definitionId={definitionId}
				/>
			</AppWriteGate>
		</AppPageShell>
	);
}
