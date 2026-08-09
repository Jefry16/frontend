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

// A factory, not a static array, so it can close over the operator's timezone
// and id. The API default is owner-first.
export const memberColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<Member, unknown>[] => {
	const roleItems = [
		{ value: "OWNER", label: roleLabel("OWNER") },
		{ value: "ADMIN", label: roleLabel("ADMIN") },
		{ value: "STAFF", label: roleLabel("STAFF") },
	];
	// Options are the members' own values; AppAsyncSetFilter dedupes them.
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
