import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell, Button } from "@vointika/ui";
import { Plus } from "lucide-react";
import { AppMenusList } from "#/menus";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppLink } from "#/shared/components/AppLink";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/menus/",
)({
	component: MenusPage,
});

function MenusPage() {
	const { tourOperatorId } = Route.useParams();
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
					<Button asChild>
						<AppLink
							to="/tour-operators/$tourOperatorId/content/menus/new"
							params={{ tourOperatorId }}
						>
							<Plus />
							{m.new_menu()}
						</AppLink>
					</Button>
				}
			/>
			<AppMenusList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
