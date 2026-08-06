import { createFileRoute } from "@tanstack/react-router";
import { AppMetaobjectEdit } from "#/metaobjects";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metaobjects/entries/$metaobjectId/edit",
)({
	component: MetaobjectEditPage,
});

function MetaobjectEditPage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId, metaobjectId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			{canWrite ? (
				<AppMetaobjectEdit
					tourOperatorId={tourOperatorId}
					metaobjectId={metaobjectId}
				/>
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
