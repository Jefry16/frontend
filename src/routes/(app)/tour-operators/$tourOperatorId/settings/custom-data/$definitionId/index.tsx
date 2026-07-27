import { createFileRoute } from "@tanstack/react-router";
import { AppMetafieldDefinitionDetail } from "#/metafields";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/custom-data/$definitionId/",
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
