import type { ColumnDef } from "@tanstack/react-table";
import { AppBadge, AppDataTableHeader } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppResourceLink } from "#/shared/links";
import { policyTypeLabel } from "./format";
import type { PolicyListItem } from "./types";

export const policyColumns = (
	tourOperatorId: string,
): ColumnDef<PolicyListItem, unknown>[] => [
	{
		id: "title",
		accessorKey: "title",
		header: (ctx) => (
			<AppDataTableHeader label={m.title()} headerContext={ctx} />
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
		header: (ctx) => (
			<AppDataTableHeader label={m.policy_type()} headerContext={ctx} />
		),
		cell: ({ row }) => (
			<AppBadge variant="secondary">
				{policyTypeLabel(row.original.type)}
			</AppBadge>
		),
	},
];
