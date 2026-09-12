import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppMenuDetail } from "#/menus";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/menus/$menuId/",
)({
	component: MenuDetailPage,
});

function MenuDetailPage() {
	const { tourOperatorId, menuId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppMenuDetail tourOperatorId={tourOperatorId} menuId={menuId} />
		</AppPageShell>
	);
}
