import { AppFormSkeleton, AppPageHeader } from "@vointika/ui";
import { ListTree } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useMenu } from "../hooks/use-menu";
import { AppMenuItemsEditor } from "./AppMenuItemsEditor";

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
			loading={<AppFormSkeleton rows={3} />}
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
