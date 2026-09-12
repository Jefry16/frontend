import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppMetafieldDefinitionEdit } from "#/metafields";
import { AppWriteGate } from "#/session";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metafields/$definitionId/edit",
)({
	component: MetafieldDefinitionEditPage,
});

function MetafieldDefinitionEditPage() {
	const { tourOperatorId, definitionId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
				<AppMetafieldDefinitionEdit
					tourOperatorId={tourOperatorId}
					definitionId={definitionId}
				/>
			</AppWriteGate>
		</AppPageShell>
	);
}
