import { AppFormSkeleton, AppPageHeader, AppResourceView } from "@vointika/ui";
import { ListTree } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
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

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/content/menus"
			params={{ tourOperatorId }}
		>
			{m.back_to_menus()}
		</AppBackLink>
	);
	return (
		<AppResourceView
			query={query}
			resource={m.menu()}
			icon={ListTree}
			breadcrumb={
				<AppBreadcrumb items={[{ label: m.content() }, { label: m.menus() }]} />
			}
			notFoundAction={backLink}
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
