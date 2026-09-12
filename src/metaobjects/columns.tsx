import type { ColumnDef } from "@tanstack/react-table";
import { AppBadge } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { timestampColumn } from "#/shared/components/table-columns";
import { metaobjectStatusBadgeVariant, metaobjectStatusLabel } from "./format";
import type { MetaobjectDefinitionListItem, MetaobjectListItem } from "./types";

export const metaobjectDefinitionColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<MetaobjectDefinitionListItem, unknown>[] => [
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
		enableSorting: true,
		header: (ctx) => (
			<AppDataTableHeader
				label={m.metaobject_type()}
				headerContext={ctx}
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => (
			<span className="font-mono text-xs">{row.original.type}</span>
		),
	},
	timestampColumn<MetaobjectDefinitionListItem>(
		"createdAt",
		m.created(),
		formatDate,
	),
];

export const metaobjectEntryColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<MetaobjectListItem, unknown>[] => [
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
	timestampColumn<MetaobjectListItem>("createdAt", m.created(), formatDate),
];
