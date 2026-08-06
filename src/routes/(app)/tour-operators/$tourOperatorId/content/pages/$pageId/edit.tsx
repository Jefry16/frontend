import { createFileRoute } from "@tanstack/react-router";
import { AppPageEdit } from "#/pages";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/pages/$pageId/edit",
)({
	component: EditPagePage,
});

function EditPagePage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId, pageId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			{canWrite ? (
				<AppPageEdit tourOperatorId={tourOperatorId} pageId={pageId} />
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
