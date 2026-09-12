import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppMenuEdit } from "#/menus";
import { AppWriteGate } from "#/session";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/menus/$menuId/edit",
)({
	component: MenuEditPage,
});

function MenuEditPage() {
	const { tourOperatorId, menuId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
				<AppMenuEdit tourOperatorId={tourOperatorId} menuId={menuId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
