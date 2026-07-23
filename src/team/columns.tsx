import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "#/components/ui/badge";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { roleBadgeVariant, roleLabel } from "./format";
import type { Member } from "./types";

const dash = () => <span className="text-muted-foreground">—</span>;

// The roster columns. A factory (not a static array) so it can close over the
// operator's timezone (joinedAt cell) and its id (name/email filters fetch their
// option lists from the members endpoint). All columns sortable; role is a static
// set filter, name/email are async set filters (`filter[field][in]`). API default
// is owner-first (joinedAt asc).
export const memberColumns = (
	tourOperatorId: string,
	timeZone?: string,
): ColumnDef<Member, unknown>[] => {
	const dateFormat = new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeZone,
	});
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
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.name()}
					headerContext={headerContext}
					allowSorting
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
					dash()
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
			cell: ({ row }) => row.original.email ?? dash(),
		},
		{
			id: "role",
			accessorKey: "role",
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
			id: "joinedAt",
			accessorKey: "joinedAt",
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.joined()}
					headerContext={headerContext}
					allowSorting
				/>
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground">
					{dateFormat.format(new Date(row.original.joinedAt))}
				</span>
			),
		},
	];
};
