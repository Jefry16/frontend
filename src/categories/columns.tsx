import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { timestampColumn } from "#/shared/components/table-columns";
import { AppResourceLink } from "#/shared/links";
import type { Category } from "./types";

export const categoryColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<Category, unknown>[] => [
	{
		id: "name",
		accessorKey: "name",
		enableSorting: true,
		header: (ctx) => (
			<AppDataTableHeader
				label={m.name()}
				headerContext={ctx}
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => (
			<AppResourceLink
				to="/tour-operators/$tourOperatorId/categories/$categoryId"
				params={{ tourOperatorId, categoryId: row.original.id }}
			>
				{row.original.name}
			</AppResourceLink>
		),
	},
	{
		id: "handle",
		accessorKey: "handle",
		header: (ctx) => (
			<AppDataTableHeader label={m.handle()} headerContext={ctx} />
		),
		cell: ({ row }) => (
			<span className="font-mono text-xs">{row.original.handle}</span>
		),
	},
	timestampColumn<Category>("createdAt", m.created(), formatDate),
];
