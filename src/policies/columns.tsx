import type { ColumnDef } from "@tanstack/react-table";
import { AppBadge } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { timestampColumn } from "#/shared/components/table-columns";
import { AppResourceLink } from "#/shared/links";
import { POLICY_TYPE_OPTIONS, policySlug, policyTypeLabel } from "./format";
import type { Policy } from "./types";

export const policyColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<Policy, unknown>[] => [
	{
		id: "title",
		accessorKey: "title",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.title()}
				headerContext={ctx}
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => (
			<AppResourceLink
				to="/tour-operators/$tourOperatorId/content/policies/$policyId"
				params={{ tourOperatorId, policyId: row.original.id }}
			>
				{row.original.title}
			</AppResourceLink>
		),
	},
	{
		id: "type",
		accessorKey: "type",
		enableSorting: true,
		header: (ctx) => (
			<AppDataTableHeader
				label={m.policy_type()}
				headerContext={ctx}
				allowFiltering="set"
				items={POLICY_TYPE_OPTIONS}
			/>
		),
		cell: ({ row }) => (
			<AppBadge variant="secondary">
				{policyTypeLabel(row.original.type)}
			</AppBadge>
		),
	},
	{
		id: "path",
		accessorKey: "type",
		header: () => null,
		cell: ({ row }) => (
			<span className="font-mono text-xs text-muted-foreground">
				/policies/{policySlug(row.original.type)}
			</span>
		),
	},
	timestampColumn<Policy>("updatedAt", m.last_updated(), formatDate),
];
