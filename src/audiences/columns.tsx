import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { timestampColumn } from "#/shared/components/table-columns";
import type { Audience } from "./types";

// The audiences columns. Everything the list schema supports gets affordances:
// name (sortable + text filter), paxPerUnit (sortable, right-aligned), createdAt
// (sortable; API default = newest first). A factory so the date cell closes over
// the operator's timezone. The name cell links to the detail once it exists.
export const audienceColumns = (
	tourOperatorId: string,
	// From useOperatorDateTime — instants render in the OPERATOR's timezone.
	formatDate: (iso: string) => string,
): ColumnDef<Audience, unknown>[] => {
	return [
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
					to="/tour-operators/$tourOperatorId/audiences/$audienceId"
					params={{ tourOperatorId, audienceId: row.original.id }}
				>
					{row.original.name}
				</AppResourceLink>
			),
		},
		{
			id: "paxPerUnit",
			accessorKey: "paxPerUnit",
			enableSorting: true,
			meta: { align: "right" },
			header: (ctx) => (
				<AppDataTableHeader label={m.pax_per_unit()} headerContext={ctx} />
			),
		},
		timestampColumn<Audience>("createdAt", m.created(), formatDate),
	];
};
