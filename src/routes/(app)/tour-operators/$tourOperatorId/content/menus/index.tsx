import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppMenusList } from "#/menus";
import * as m from "#/paraglide/messages";
import { usePermissions } from "#/session";
import { AppBreadcrumb, AppNewLink } from "#/shared/links";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/menus/",
)({
	component: MenusPage,
});

function MenusPage() {
	const { tourOperatorId } = Route.useParams();
	const { canWrite } = usePermissions();

	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.menus()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.content() }, { label: m.menus() }]}
					/>
				}
				actions={
					canWrite && (
						<AppNewLink
							to="/tour-operators/$tourOperatorId/content/menus/new"
							params={{ tourOperatorId }}
						>
							{m.new_menu()}
						</AppNewLink>
					)
				}
			/>
			<AppMenusList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
