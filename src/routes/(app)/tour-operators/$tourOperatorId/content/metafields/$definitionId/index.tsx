import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppMetafieldDefinitionDetail } from "#/metafields";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metafields/$definitionId/",
)({
	component: MetafieldDefinitionDetailPage,
});

function MetafieldDefinitionDetailPage() {
	const { tourOperatorId, definitionId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppMetafieldDefinitionDetail
				tourOperatorId={tourOperatorId}
				definitionId={definitionId}
			/>
		</AppPageShell>
	);
}
