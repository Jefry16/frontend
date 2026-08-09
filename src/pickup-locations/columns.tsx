import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { timestampColumn } from "#/shared/components/table-columns";
import { formatTime } from "./format";
import type { PickupLocation } from "./types";

// The pickup-location columns: name (sortable + text filter, links to detail),
// meeting time (sortable), createdAt (sortable; API default = newest first).
// A factory so the cells close over the operator id and timezone.
export const pickupLocationColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<PickupLocation, unknown>[] => {
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
					to="/tour-operators/$tourOperatorId/pickup-locations/$pickupLocationId"
					params={{ tourOperatorId, pickupLocationId: row.original.id }}
				>
					{row.original.name}
				</AppResourceLink>
			),
		},
		{
			id: "time",
			accessorKey: "time",
			enableSorting: true,
			header: (ctx) => (
				<AppDataTableHeader label={m.time()} headerContext={ctx} />
			),
			cell: ({ row }) => formatTime(row.original.time),
		},
		timestampColumn<PickupLocation>("createdAt", m.created(), formatDate),
	];
};
