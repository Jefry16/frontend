import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { formatTime } from "./format";
import type { PickupLocation } from "./types";

// The pickup-location columns: name (sortable + text filter, links to detail),
// meeting time (sortable), createdAt (sortable; API default = newest first).
// A factory so the cells close over the operator id and timezone.
export const pickupLocationColumns = (
	tourOperatorId: string,
	timeZone?: string,
): ColumnDef<PickupLocation, unknown>[] => {
	const dateFormat = new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeZone,
	});

	return [
		{
			id: "name",
			accessorKey: "name",
			header: (ctx) => (
				<AppDataTableHeader
					label={m.name()}
					headerContext={ctx}
					allowSorting
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
			header: (ctx) => (
				<AppDataTableHeader label={m.time()} headerContext={ctx} allowSorting />
			),
			cell: ({ row }) => formatTime(row.original.time),
		},
		{
			id: "createdAt",
			accessorKey: "createdAt",
			header: (ctx) => (
				<AppDataTableHeader
					label={m.created()}
					headerContext={ctx}
					allowSorting
				/>
			),
			cell: ({ row }) => dateFormat.format(new Date(row.original.createdAt)),
		},
	];
};
