import { ListTree } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useMenu } from "../hooks/use-menu";
import { AppMenuItemsEditor } from "./AppMenuItemsEditor";

// The menu-items edit page: fetches the menu, then hands the loaded tree to
// the editor (whose local state seeds once from it).
export const AppMenuEdit = ({
	tourOperatorId,
	menuId,
}: {
	tourOperatorId: string;
	menuId: string;
}) => {
	const query = useMenu(tourOperatorId, menuId);

	return (
		<AppResourceView
			query={query}
			resource={m.menu()}
			icon={ListTree}
			breadcrumb={
				<AppBreadcrumb items={[{ label: m.content() }, { label: m.menus() }]} />
			}
			loading={
				<Card>
					<CardContent className="flex flex-col gap-4">
						{["a", "b", "c"].map((k) => (
							<Skeleton key={k} className="h-9 w-full" />
						))}
					</CardContent>
				</Card>
			}
		>
			{(menu) => (
				<>
					<AppPageHeader
						title={m.edit_menu_items()}
						breadcrumb={
							<AppBreadcrumb
								items={[
									{ label: m.content() },
									{
										label: m.menus(),
										to: "/tour-operators/$tourOperatorId/content/menus",
										params: { tourOperatorId },
									},
									{
										label: menu.title,
										to: "/tour-operators/$tourOperatorId/content/menus/$menuId",
										params: { tourOperatorId, menuId },
									},
									{ label: m.edit() },
								]}
							/>
						}
					/>
					<AppMenuItemsEditor tourOperatorId={tourOperatorId} menu={menu} />
				</>
			)}
		</AppResourceView>
	);
};
