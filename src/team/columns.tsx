import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "#/components/ui/badge";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { roleBadgeVariant, roleLabel } from "./format";
import type { Member } from "./types";

const dash = () => <span className="text-muted-foreground">—</span>;

// The roster columns. A factory (not a static array) so the joinedAt cell can
// format in the operator's timezone. Filterable by role (backend `set`),
// sortable by joined date (backend `sortable`); the API default is owner-first.
export const memberColumns = (
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

	return [
		{
			id: "name",
			header: () => m.name(),
			cell: ({ row }) =>
				row.original.name ? (
					<span className="font-medium">{row.original.name}</span>
				) : (
					dash()
				),
		},
		{
			id: "email",
			header: () => m.email(),
			cell: ({ row }) => row.original.email ?? dash(),
		},
		{
			id: "role",
			accessorKey: "role",
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.role()}
					headerContext={headerContext}
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
