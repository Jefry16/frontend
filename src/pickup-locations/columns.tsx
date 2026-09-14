import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { timestampColumn } from "#/shared/components/table-columns";
import { AppResourceLink } from "#/shared/links";
import { formatTime } from "./format";
import type { PickupLocation } from "./types";

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
