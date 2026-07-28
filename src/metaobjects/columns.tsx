import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { metaobjectStatusBadgeVariant, metaobjectStatusLabel } from "./format";
import type { MetaobjectDefinitionListItem, MetaobjectListItem } from "./types";

// The definitions columns: name (searchable, links to the detail), the type
// slug (mono — what themes will reference), created.
export const metaobjectDefinitionColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<MetaobjectDefinitionListItem, unknown>[] => [
	{
		id: "name",
		accessorKey: "name",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.name()}
				headerContext={ctx}
				allowSorting
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => (
			<AppResourceLink
				to="/tour-operators/$tourOperatorId/content/metaobjects/$definitionId"
				params={{ tourOperatorId, definitionId: row.original.id }}
			>
				{row.original.name}
			</AppResourceLink>
		),
	},
	{
		id: "type",
		accessorKey: "type",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.metaobject_type()}
				headerContext={ctx}
				allowSorting
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => (
			<span className="font-mono text-xs">{row.original.type}</span>
		),
	},
	{
		id: "createdAt",
		accessorKey: "createdAt",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.created()}
				headerContext={ctx}
				allowSorting
			/>
		),
		cell: ({ row }) => formatDate(row.original.createdAt),
	},
];

// One definition's entries (the definition detail's table): name (links to
// the entry), handle (mono), status badge (published is a boolean [eq]
// filter server-side — no set-filter UI, badge only), created.
export const metaobjectEntryColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<MetaobjectListItem, unknown>[] => [
	{
		id: "name",
		accessorKey: "name",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.name()}
				headerContext={ctx}
				allowSorting
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => (
			<AppResourceLink
				to="/tour-operators/$tourOperatorId/content/metaobjects/entries/$metaobjectId"
				params={{ tourOperatorId, metaobjectId: row.original.id }}
			>
				{row.original.name}
			</AppResourceLink>
		),
	},
	{
		id: "handle",
		accessorKey: "handle",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.handle()}
				headerContext={ctx}
				allowSorting
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => (
			<span className="font-mono text-xs">{row.original.handle}</span>
		),
	},
	{
		id: "published",
		accessorKey: "published",
		header: (ctx) => (
			<AppDataTableHeader label={m.status()} headerContext={ctx} />
		),
		cell: ({ row }) => (
			<AppBadge variant={metaobjectStatusBadgeVariant(row.original.published)}>
				{metaobjectStatusLabel(row.original.published)}
			</AppBadge>
		),
	},
	{
		id: "createdAt",
		accessorKey: "createdAt",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.created()}
				headerContext={ctx}
				allowSorting
			/>
		),
		cell: ({ row }) => formatDate(row.original.createdAt),
	},
];
