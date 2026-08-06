import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ListTree, Pencil, TextCursorInput, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppActivityCard } from "#/audit";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useAppToast } from "#/hooks/use-app-toast";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useOperatorDateTime, usePermissions } from "#/tour-operator";
import { menuLinkTypeLabel } from "../format";
import { useMenu } from "../hooks/use-menu";
import { useMenuActions } from "../hooks/use-menu-actions";
import type { Menu, MenuItemNode } from "../types";
import { AppMenuRenameDialog } from "./AppMenuRenameDialog";

// Menu detail: the menu's facts (handle = what the theme references) + the
// item tree read-only + Edit items / Rename / Delete actions. The item tree
// is edited wholesale on its own page.
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
			loading={
				<Card>
					<CardContent className="grid grid-cols-2 gap-4">
						{["a", "b", "c", "d"].map((k) => (
							<Skeleton key={k} className="h-12 w-full" />
						))}
					</CardContent>
				</Card>
			}
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
				actions={<AppPageActions actions={canWrite ? actions : []} />}
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
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>{m.menu_items()}</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							navigate({
								to: "/tour-operators/$tourOperatorId/content/menus/$menuId/edit",
								params: { tourOperatorId, menuId: menu.id },
							})
						}
					>
						{m.edit_menu_items()}
					</Button>
				</CardHeader>
				<CardContent>
					{menu.items.length === 0 ? (
						<p className="text-sm text-muted-foreground">{m.no_menu_items()}</p>
					) : (
						<ItemTree items={menu.items} />
					)}
				</CardContent>
			</Card>

			<AppActivityCard
				tourOperatorId={tourOperatorId}
				entityType="MENU"
				entityId={menu.id}
			/>

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

// The read-only tree: each item's title + its link kind (the URL for external
// links), children indented under a rail.
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
