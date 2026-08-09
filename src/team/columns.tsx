import type { ColumnDef } from "@tanstack/react-table";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { EmptyValue } from "#/shared/components/EmptyValue";
import { timestampColumn } from "#/shared/components/table-columns";
import { roleBadgeVariant, roleLabel } from "./format";
import type { Member } from "./types";

// The roster columns. A factory (not a static array) so it can close over the
// operator's timezone (joinedAt cell) and its id (name/email filters fetch their
// option lists from the members endpoint). All columns sortable; role is a static
// set filter, name/email are async set filters (`filter[field][in]`). API default
// is owner-first (joinedAt asc).
export const memberColumns = (
	tourOperatorId: string,
	// From useOperatorDateTime — instants render in the OPERATOR's timezone.
	formatDate: (iso: string) => string,
): ColumnDef<Member, unknown>[] => {
	const roleItems = [
		{ value: "OWNER", label: roleLabel("OWNER") },
		{ value: "ADMIN", label: roleLabel("ADMIN") },
		{ value: "STAFF", label: roleLabel("STAFF") },
	];
	// name/email filter options are the members' own values, fetched from the
	// roster endpoint (deduped in AppAsyncSetFilter).
	const endpoint = `/tour-operators/${tourOperatorId}/members`;
	const optionsKey = queryKeys.members(tourOperatorId);

	return [
		{
			id: "name",
			enableSorting: true,
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.name()}
					headerContext={headerContext}
					allowFiltering="setAsync"
					endpoint={endpoint}
					queryKey={optionsKey}
					valueKey="name"
					labelKey="name"
				/>
			),
			cell: ({ row }) =>
				row.original.name ? (
					<AppResourceLink
						to="/tour-operators/$tourOperatorId/settings/members/$userId"
						params={{ tourOperatorId, userId: row.original.id }}
						className="font-medium"
					>
						{row.original.name}
					</AppResourceLink>
				) : (
					<EmptyValue />
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
			cell: ({ row }) => row.original.email ?? <EmptyValue />,
		},
		{
			id: "role",
			accessorKey: "role",
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
		timestampColumn<Member>("joinedAt", m.joined(), formatDate),
	];
};
