import { createFileRoute } from "@tanstack/react-router";
import { AppMetaobjectDefinitionEdit } from "#/metaobjects";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metaobjects/$definitionId/edit",
)({
	component: MetaobjectDefinitionEditPage,
});

function MetaobjectDefinitionEditPage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId, definitionId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			{canWrite ? (
				<AppMetaobjectDefinitionEdit
					tourOperatorId={tourOperatorId}
					definitionId={definitionId}
				/>
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
