import { createFileRoute } from "@tanstack/react-router";
import { AppMenuEdit } from "#/menus";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/menus/$menuId/edit",
)({
	component: MenuEditPage,
});

function MenuEditPage() {
	const { tourOperatorId, menuId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppMenuEdit tourOperatorId={tourOperatorId} menuId={menuId} />
		</AppPageShell>
	);
}
