import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "#/components/ui/button";
import { AppMenusList } from "#/menus";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppLink } from "#/shared/components/AppLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/menus/",
)({
	component: MenusPage,
});

// Content → Menus: the operator's storefront navigation menus.
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
