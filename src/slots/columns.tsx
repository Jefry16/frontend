import type { ColumnDef } from "@tanstack/react-table";
import { AppBadge, AppDataTableHeader } from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppResourceLink } from "#/shared/links";
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

export const slotColumns = (
	tourOperatorId: string,
): ColumnDef<Slot, unknown>[] => [
	{
		id: "experienceId",
		accessorKey: "experienceName",
		enableSorting: true,
		meta: { sortField: "experienceName" },
		header: (ctx) => (
			<AppDataTableHeader
				label={m.experience()}
				headerContext={ctx}
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
		enableSorting: true,
		header: (ctx) => (
			<AppDataTableHeader label={m.starts()} headerContext={ctx} />
		),
		cell: ({ row }) => formatSlotDateTime(row.original.startAt),
	},
	{
		id: "day",
		accessorKey: "day",
		enableSorting: true,
		header: (ctx) => (
			<AppDataTableHeader
				label={m.day()}
				headerContext={ctx}
				allowFiltering="set"
				items={DAY_OPTIONS}
			/>
		),
		cell: ({ row }) => formatDayName(row.original.day),
	},
	{
		id: "status",
		accessorKey: "status",
		enableSorting: true,
		header: (ctx) => (
			<AppDataTableHeader
				label={m.status()}
				headerContext={ctx}
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
		header: () => <span>{m.booked()}</span>,
		cell: ({ row }) => formatBookedCapacity(row.original.audiencePrices),
	},
];
