import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "#/components/ui/badge";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import {
	effectiveStatus,
	roleBadgeVariant,
	roleLabel,
	statusBadgeVariant,
	statusLabel,
} from "./format";
import type { Invitation } from "./types";

// The invitations columns. A factory (not a static array) so it can close over
// the operator's timezone (Sent cell) and its id (invitee name/email filters
// fetch their option lists from the invitations endpoint). Every column is
// sortable; status/role are static set filters and invitee name/email are async
// set filters (`filter[field][in]`) — all served off the invitation's own row.
// API default is newest-first (-createdAt).
export const invitationColumns = (
	tourOperatorId: string,
	timeZone?: string,
): ColumnDef<Invitation, unknown>[] => {
	const dateFormat = new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeZone,
	});
	// Invitations are only ever ADMIN or STAFF (OWNER can't be invited).
	const roleItems = [
		{ value: "ADMIN", label: roleLabel("ADMIN") },
		{ value: "STAFF", label: roleLabel("STAFF") },
	];
	// EXPIRED is a display-only state (stored PENDING + past its window), so it is
	// not an offered filter value — the backend keeps such rows as PENDING.
	const statusItems = [
		{ value: "PENDING", label: statusLabel("PENDING") },
		{ value: "ACCEPTED", label: statusLabel("ACCEPTED") },
		{ value: "REVOKED", label: statusLabel("REVOKED") },
	];
	// name/email filter options are the invitees' own values, fetched from the
	// invitations endpoint (deduped in AppAsyncSetFilter).
	const endpoint = `/tour-operators/${tourOperatorId}/invitations`;
	const optionsKey = queryKeys.invitations(tourOperatorId);

	return [
		{
			id: "name",
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.invitee()}
					headerContext={headerContext}
					allowSorting
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
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.email()}
					headerContext={headerContext}
					allowSorting
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
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.role()}
					headerContext={headerContext}
					allowSorting
					allowFiltering="set"
					items={roleItems}
				/>
			),
			cell: ({ row }) => (
				<Badge variant={roleBadgeVariant(row.original.role)}>
					{roleLabel(row.original.role)}
				</Badge>
			),
		},
		{
			id: "status",
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.status()}
					headerContext={headerContext}
					allowSorting
					allowFiltering="set"
					items={statusItems}
				/>
			),
			cell: ({ row }) => {
				const status = effectiveStatus(row.original);
				return (
					<Badge variant={statusBadgeVariant(status)}>
						{statusLabel(status)}
					</Badge>
				);
			},
		},
		{
			id: "invitedByName",
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.invited_by()}
					headerContext={headerContext}
					allowSorting
					allowFiltering="setAsync"
					endpoint={endpoint}
					queryKey={optionsKey}
					valueKey="invitedBy.name"
					labelKey="invitedBy.name"
				/>
			),
			cell: ({ row }) => row.original.invitedBy.name,
		},
		{
			id: "createdAt",
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.sent()}
					headerContext={headerContext}
					allowSorting
				/>
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground">
					{dateFormat.format(new Date(row.original.createdAt))}
				</span>
			),
		},
	];
};
