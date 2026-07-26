import type { ColumnDef } from "@tanstack/react-table";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import {
	DAY_OPTIONS,
	formatBookedCapacity,
	formatDayName,
	formatSlotDateTime,
	formatSlotStatus,
	STATUS_OPTIONS,
	slotStatusBadgeVariant,
} from "./format";
import type { Slot } from "./types";

// The availability columns: experience (async set filter by id, sortable by
// name, links to the SLOT detail), start (sortable; the server's default sort,
// soonest first), day (set filter), status (set filter + badge), booked/capacity
// summary. startAt has no server-side date filter yet (backend gap, noted).
export const slotColumns = (
	tourOperatorId: string,
): ColumnDef<Slot, unknown>[] => [
	{
		id: "experienceId",
		accessorKey: "experienceName",
		meta: { sortField: "experienceName" },
		header: (ctx) => (
			<AppDataTableHeader
				label={m.experience()}
				headerContext={ctx}
				allowSorting
				allowFiltering="setAsync"
				endpoint={`/tour-operators/${tourOperatorId}/experiences`}
				queryKey={queryKeys.experiences(tourOperatorId)}
			/>
		),
		cell: ({ row }) => (
			<AppResourceLink
				to="/tour-operators/$tourOperatorId/availability/$slotId"
				params={{ tourOperatorId, slotId: row.original.id }}
			>
				{row.original.experienceName}
			</AppResourceLink>
		),
	},
	{
		id: "startAt",
		accessorKey: "startAt",
		header: (ctx) => (
			<AppDataTableHeader label={m.starts()} headerContext={ctx} allowSorting />
		),
		cell: ({ row }) => formatSlotDateTime(row.original.startAt),
	},
	{
		id: "day",
		accessorKey: "day",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.day()}
				headerContext={ctx}
				allowSorting
				allowFiltering="set"
				items={DAY_OPTIONS}
			/>
		),
		cell: ({ row }) => formatDayName(row.original.day),
	},
	{
		id: "status",
		accessorKey: "status",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.status()}
				headerContext={ctx}
				allowSorting
				allowFiltering="set"
				items={STATUS_OPTIONS}
			/>
		),
		cell: ({ row }) => (
			<AppBadge variant={slotStatusBadgeVariant(row.original.status)}>
				{formatSlotStatus(row.original.status)}
			</AppBadge>
		),
	},
	{
		id: "booked",
		meta: { align: "right" },
		header: () => <span className="font-semibold">{m.booked()}</span>,
		cell: ({ row }) => formatBookedCapacity(row.original.audiencePrices),
	},
];
