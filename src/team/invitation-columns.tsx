import type { ColumnDef } from "@tanstack/react-table";
import { AppBadge, AppDataTableHeader, timestampColumn } from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppResourceLink } from "#/shared/links";
import {
	effectiveStatus,
	roleBadgeVariant,
	roleLabel,
	statusBadgeVariant,
	statusLabel,
} from "./format";
import type { Invitation } from "./types";

export const invitationColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<Invitation, unknown>[] => {
	const roleItems = [
		{ value: "ADMIN", label: roleLabel("ADMIN") },
		{ value: "STAFF", label: roleLabel("STAFF") },
	];
	const statusItems = [
		{ value: "PENDING", label: statusLabel("PENDING") },
		{ value: "ACCEPTED", label: statusLabel("ACCEPTED") },
		{ value: "REVOKED", label: statusLabel("REVOKED") },
	];
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
