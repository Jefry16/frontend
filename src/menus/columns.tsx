import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { timestampColumn } from "#/shared/components/table-columns";
import type { MenuListItem } from "./types";

export const menuColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<MenuListItem, unknown>[] => [
	{
		id: "title",
		accessorKey: "title",
		enableSorting: true,
		header: (ctx) => (
			<AppDataTableHeader
				label={m.title()}
				headerContext={ctx}
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => (
			<AppResourceLink
				to="/tour-operators/$tourOperatorId/content/menus/$menuId"
				params={{ tourOperatorId, menuId: row.original.id }}
			>
				{row.original.title}
			</AppResourceLink>
		),
	},
	{
		id: "handle",
		accessorKey: "handle",
		enableSorting: true,
		header: (ctx) => (
			<AppDataTableHeader
				label={m.handle()}
				headerContext={ctx}
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => (
			<span className="font-mono text-xs">{row.original.handle}</span>
		),
	},
	timestampColumn<MenuListItem>("createdAt", m.created(), formatDate),
];
