import { createFileRoute } from "@tanstack/react-router";
import { AppMetafieldDefinitionEdit } from "#/metafields";
import { AppWriteGate } from "#/session";
import { AppPageShell } from "#/shared/components/AppPageShell";

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
