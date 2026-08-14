import { createFileRoute } from "@tanstack/react-router";
import { AppMenuForm } from "#/menus";
import * as m from "#/paraglide/messages";
import { AppWriteGate } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/menus/new",
)({
	component: NewMenuPage,
});

// Static "new" wins over the dynamic $menuId sibling.
function NewMenuPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppPageHeader
				title={m.new_menu()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.content() },
							{
								label: m.menus(),
								to: "/tour-operators/$tourOperatorId/content/menus",
								params: { tourOperatorId },
							},
							{ label: m.new_menu() },
						]}
					/>
				}
			/>
			<AppWriteGate>
				<AppMenuForm tourOperatorId={tourOperatorId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
