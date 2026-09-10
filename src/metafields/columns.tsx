import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { timestampColumn } from "#/shared/components/table-columns";
import {
	OWNER_TYPE_FILTER_OPTIONS,
	ownerTypeLabel,
	TYPE_FILTER_OPTIONS,
	typeLabel,
} from "./format";
import type { MetafieldDefinitionListItem } from "./types";

export const metafieldDefinitionColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<MetafieldDefinitionListItem, unknown>[] => [
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
				to="/tour-operators/$tourOperatorId/content/metafields/$definitionId"
				params={{ tourOperatorId, definitionId: row.original.id }}
			>
				{row.original.name}
			</AppResourceLink>
		),
	},
	{
		id: "namespace",
		accessorKey: "namespace",
		enableSorting: true,
		header: (ctx) => (
			<AppDataTableHeader
				label={m.metafield_identifier()}
				headerContext={ctx}
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => (
			<span className="font-mono text-xs">
				{row.original.namespace}.{row.original.key}
			</span>
		),
	},
	{
		id: "ownerType",
		accessorKey: "ownerType",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.metafield_applies_to()}
				headerContext={ctx}
				allowFiltering="set"
				items={OWNER_TYPE_FILTER_OPTIONS}
			/>
		),
		cell: ({ row }) => (
			<AppBadge variant="secondary">
				{ownerTypeLabel(row.original.ownerType)}
			</AppBadge>
		),
	},
	{
		id: "type",
		accessorKey: "type",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.metafield_type()}
				headerContext={ctx}
				allowFiltering="set"
				items={TYPE_FILTER_OPTIONS}
			/>
		),
		cell: ({ row }) => typeLabel(row.original.type),
	},
	timestampColumn("createdAt", m.created(), formatDate),
];
