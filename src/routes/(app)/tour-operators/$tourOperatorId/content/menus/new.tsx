import { createFileRoute } from "@tanstack/react-router";
import { AppMenuForm } from "#/menus";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/menus/new",
)({
	component: NewMenuPage,
});

// Static "new" wins over the dynamic $menuId sibling.
function NewMenuPage() {
	const { canWrite } = usePermissions();
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
			{canWrite ? (
				<AppMenuForm tourOperatorId={tourOperatorId} />
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
