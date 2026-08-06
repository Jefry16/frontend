import { createFileRoute } from "@tanstack/react-router";
import { AppMenuEdit } from "#/menus";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/menus/$menuId/edit",
)({
	component: MenuEditPage,
});

function MenuEditPage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId, menuId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			{canWrite ? (
				<AppMenuEdit tourOperatorId={tourOperatorId} menuId={menuId} />
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
