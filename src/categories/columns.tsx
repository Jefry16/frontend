import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { timestampColumn } from "#/shared/components/table-columns";
import type { Category } from "./types";

// The categories columns: name (sortable + text filter, links to the detail),
// handle (mono — the storefront address), created.
//
// The handle is deliberately neither sortable nor filterable: the backend list
// schema accepts sort and filter on name, createdAt and id only, and answers a
// hard 422 for anything else. It earns its place read-only because the value is
// derived and not guessable — accents are stripped and a collision appends a
// suffix, so "Café" may have landed as `cafe` or as `cafe-2`.
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
