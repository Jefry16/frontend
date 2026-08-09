import type { ColumnDef } from "@tanstack/react-table";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { timestampColumn } from "#/shared/components/table-columns";
import {
	effectiveStatus,
	roleBadgeVariant,
	roleLabel,
	statusBadgeVariant,
	statusLabel,
} from "./format";
import type { Invitation } from "./types";

// A factory, not a static array, so it can close over the operator's timezone
// and id. The API default is newest-first.
export const invitationColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<Invitation, unknown>[] => {
	// OWNER can't be invited.
	const roleItems = [
		{ value: "ADMIN", label: roleLabel("ADMIN") },
		{ value: "STAFF", label: roleLabel("STAFF") },
	];
	// EXPIRED is display-only — the backend stores such rows as PENDING — so it
	// cannot be offered as a filter value.
	const statusItems = [
		{ value: "PENDING", label: statusLabel("PENDING") },
		{ value: "ACCEPTED", label: statusLabel("ACCEPTED") },
		{ value: "REVOKED", label: statusLabel("REVOKED") },
	];
	// Options are the invitees' own values; AppAsyncSetFilter dedupes them.
	const endpoint = `/tour-operators/${tourOperatorId}/invitations`;
	const optionsKey = queryKeys.invitations(tourOperatorId);

	return [
		{
			id: "name",
			enableSorting: true,
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.invitee()}
					headerContext={headerContext}
					allowFiltering="setAsync"
					endpoint={endpoint}
					queryKey={optionsKey}
					valueKey="name"
					labelKey="name"
				/>
			),
			cell: ({ row }) => (
				<AppResourceLink
					to="/tour-operators/$tourOperatorId/settings/invitations/$invitationId"
					params={{ tourOperatorId, invitationId: row.original.id }}
					className="font-medium"
				>
					{row.original.name}
				</AppResourceLink>
			),
		},
		{
			id: "email",
			enableSorting: true,
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.email()}
					headerContext={headerContext}
					allowFiltering="setAsync"
					endpoint={endpoint}
					queryKey={optionsKey}
					valueKey="email"
					labelKey="email"
				/>
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground">{row.original.email}</span>
			),
		},
		{
			id: "role",
			enableSorting: true,
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.role()}
					headerContext={headerContext}
					allowFiltering="set"
					items={roleItems}
				/>
			),
			cell: ({ row }) => (
				<AppBadge variant={roleBadgeVariant(row.original.role)}>
					{roleLabel(row.original.role)}
				</AppBadge>
			),
		},
		{
			id: "status",
			enableSorting: true,
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.status()}
					headerContext={headerContext}
					allowFiltering="set"
					items={statusItems}
				/>
			),
			cell: ({ row }) => {
				const status = effectiveStatus(row.original);
				return (
					<AppBadge variant={statusBadgeVariant(status)}>
						{statusLabel(status)}
					</AppBadge>
				);
			},
		},
		{
			id: "invitedByName",
			enableSorting: true,
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.invited_by()}
					headerContext={headerContext}
					allowFiltering="setAsync"
					endpoint={endpoint}
					queryKey={optionsKey}
					valueKey="invitedBy.name"
					labelKey="invitedBy.name"
				/>
			),
			cell: ({ row }) => row.original.invitedBy.name,
		},
		timestampColumn<Invitation>("createdAt", m.sent(), formatDate),
	];
};
