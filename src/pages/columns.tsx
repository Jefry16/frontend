import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { timestampColumn } from "#/shared/components/table-columns";
import {
	PAGE_STATUS_OPTIONS,
	pageStatusBadgeVariant,
	pageStatusLabel,
} from "./format";
import type { PageListItem } from "./types";

// The pages columns: title (searchable, links to the detail), handle
// (searchable, mono — it IS the URL), status (set filter + badge), created.
export const pageColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<PageListItem, unknown>[] => [
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
				to="/tour-operators/$tourOperatorId/content/pages/$pageId"
				params={{ tourOperatorId, pageId: row.original.id }}
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
			<span className="font-mono text-xs">/{row.original.handle}</span>
		),
	},
	{
		id: "status",
		accessorKey: "status",
		enableSorting: true,
		header: (ctx) => (
			<AppDataTableHeader
				label={m.status()}
				headerContext={ctx}
				allowFiltering="set"
				items={PAGE_STATUS_OPTIONS}
			/>
		),
		cell: ({ row }) => (
			<AppBadge variant={pageStatusBadgeVariant(row.original.status)}>
				{pageStatusLabel(row.original.status)}
			</AppBadge>
		),
	},
	timestampColumn<PageListItem>("createdAt", m.created(), formatDate),
];
