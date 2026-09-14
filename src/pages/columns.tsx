import type { ColumnDef } from "@tanstack/react-table";
import { AppBadge } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { timestampColumn } from "#/shared/components/table-columns";
import { AppResourceLink } from "#/shared/links";
import { pageStatusBadgeVariant, pageStatusLabel } from "./format";
import type { PageListItem } from "./types";

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
		id: "published",
		accessorKey: "published",
		header: (ctx) => (
			<AppDataTableHeader label={m.status()} headerContext={ctx} />
		),
		cell: ({ row }) => (
			<AppBadge variant={pageStatusBadgeVariant(row.original.published)}>
				{pageStatusLabel(row.original.published)}
			</AppBadge>
		),
	},
	timestampColumn<PageListItem>("createdAt", m.created(), formatDate),
];
