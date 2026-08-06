import { createFileRoute } from "@tanstack/react-router";
import { AppMetafieldDefinitionEdit } from "#/metafields";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metafields/$definitionId/edit",
)({
	component: MetafieldDefinitionEditPage,
});

function MetafieldDefinitionEditPage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId, definitionId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			{canWrite ? (
				<AppMetafieldDefinitionEdit
					tourOperatorId={tourOperatorId}
					definitionId={definitionId}
				/>
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
