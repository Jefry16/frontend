import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	type AppAction,
	AppDetailField,
	AppDetailSkeleton,
	AppPageActions,
	AppPageHeader,
	AppResourceView,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	useAppToast,
} from "@vointika/ui";
import { ListTree, Pencil, TextCursorInput, Trash2 } from "lucide-react";
import { useState } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { menuLinkTypeLabel } from "../format";
import { useMenu } from "../hooks/use-menu";
import { useMenuActions } from "../hooks/use-menu-actions";
import type { Menu, MenuItemNode } from "../types";
import { AppMenuRenameDialog } from "./AppMenuRenameDialog";

export const AppMenuDetail = ({
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
			loading={<AppDetailSkeleton fields={4} />}
		>
			{(menu) => <MenuView tourOperatorId={tourOperatorId} menu={menu} />}
		</AppResourceView>
	);
};

const MenuView = ({
	tourOperatorId,
	menu,
}: {
	tourOperatorId: string;
	menu: Menu;
}) => {
	const { formatDate } = useOperatorDateTime();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const { rename, remove } = useMenuActions(tourOperatorId, menu.id);
	const [renameOpen, setRenameOpen] = useState(false);

	const { canWrite } = usePermissions();
	const actions: AppAction[] = [
		{
			id: "edit-items",
			label: m.edit_menu_items(),
			icon: Pencil,
			onSelect: () =>
				navigate({
					to: "/tour-operators/$tourOperatorId/content/menus/$menuId/edit",
					params: { tourOperatorId, menuId: menu.id },
				}),
		},
		{
			id: "rename",
			label: m.rename(),
			icon: TextCursorInput,
			onSelect: () => setRenameOpen(true),
		},
		{
			id: "delete",
			label: m.delete_menu(),
			icon: Trash2,
			variant: "destructive",
			pending: remove.isPending,
			confirm: {
				title: m.delete_menu_confirm_title(),
				description: m.delete_menu_confirm_body(),
			},
			onSelect: () =>
				remove.mutate(undefined, {
					onSuccess: () => {
						toast.deleted(m.menu());
						queryClient.removeQueries({
							queryKey: queryKeys.menu(tourOperatorId, menu.id),
						});
						navigate({
							to: "/tour-operators/$tourOperatorId/content/menus",
							params: { tourOperatorId },
						});
					},
				}),
		},
	];

	return (
		<>
			<AppPageHeader
				title={menu.title}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.content() },
							{
								label: m.menus(),
								to: "/tour-operators/$tourOperatorId/content/menus",
								params: { tourOperatorId },
							},
							{ label: menu.title },
						]}
					/>
				}
				actions={<AppPageActions actions={actions} canWrite={canWrite} />}
			/>

			<Card>
				<CardContent>
					<dl className="grid grid-cols-2 gap-4">
						<AppDetailField label={m.handle()}>
							<span className="font-mono text-sm">{menu.handle}</span>
						</AppDetailField>
						<AppDetailField label={m.created()}>
							{formatDate(menu.createdAt)}
						</AppDetailField>
					</dl>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{m.menu_items()}</CardTitle>
				</CardHeader>
				<CardContent>
					{menu.items.length === 0 ? (
						<p className="text-sm text-muted-foreground">{m.no_menu_items()}</p>
					) : (
						<ItemTree items={menu.items} />
					)}
				</CardContent>
			</Card>

			<AppMenuRenameDialog
				open={renameOpen}
				onOpenChange={setRenameOpen}
				currentTitle={menu.title}
				pending={rename.isPending}
				onRename={(title) =>
					rename.mutate({ title }, { onSuccess: () => setRenameOpen(false) })
				}
			/>
		</>
	);
};

const ItemTree = ({ items }: { items: MenuItemNode[] }) => (
	<ul className="flex flex-col gap-1.5">
		{items.map((item) => (
			<li key={item.id}>
				<div className="flex items-baseline gap-2 py-0.5">
					<span className="text-sm font-medium">{item.title}</span>
					<span className="text-xs text-muted-foreground">
						{item.linkType === "EXTERNAL_URL" && item.url
							? item.url
							: menuLinkTypeLabel(item.linkType)}
					</span>
				</div>
				{item.children.length > 0 && (
					<div className="ml-2 border-l pl-4">
						<ItemTree items={item.children} />
					</div>
				)}
			</li>
		))}
	</ul>
);
