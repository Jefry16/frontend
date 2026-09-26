import type { ColumnDef } from "@tanstack/react-table";
import {
	AppBadge,
	AppDataTableHeader,
	EmptyValue,
	formatMoney,
	timestampColumn,
} from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import { AppResourceLink } from "#/shared/links";
import { formatSlotDateTime } from "#/slots";
import { BOOKING_STATUS_OPTIONS, bookingStatusLabel } from "./format";
import type { BookingManifestItem, OrderListItem } from "./types";

const money = (amount: number, currency: string | null) => (
	<span className="block text-right tabular-nums">
		{formatMoney(amount, currency, getLocale())}
	</span>
);

export const orderColumns = (
	tourOperatorId: string,
	formatDateTime: (iso: string) => string,
): ColumnDef<OrderListItem, unknown>[] => [
	{
		id: "number",
		accessorKey: "number",
		enableSorting: true,
		header: (ctx) => (
			<AppDataTableHeader label={m.order()} headerContext={ctx} />
		),
		cell: ({ row }) => (
			<AppResourceLink
				to="/tour-operators/$tourOperatorId/orders/$orderId"
				params={{ tourOperatorId, orderId: row.original.id }}
				className="font-mono"
			>
				{row.original.reference}
			</AppResourceLink>
		),
	},
	{
		id: "customerName",
		accessorKey: "customerName",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.customer()}
				headerContext={ctx}
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => row.original.customerName,
	},
	{
		id: "customerEmail",
		accessorKey: "customerEmail",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.email()}
				headerContext={ctx}
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => row.original.customerEmail,
	},
	{
		id: "totalAmount",
		accessorKey: "totalAmount",
		header: () => <span className="block text-right">{m.total()}</span>,
		cell: ({ row }) => money(row.original.totalAmount, row.original.currency),
	},
	timestampColumn<OrderListItem>("placedAt", m.placed(), formatDateTime),
];

export const bookingColumns = (
	tourOperatorId: string,
	currency: string | null,
): ColumnDef<BookingManifestItem, unknown>[] => [
	{
		id: "reference",
		header: () => <span>{m.booking()}</span>,
		cell: ({ row }) => (
			<AppResourceLink
				to="/tour-operators/$tourOperatorId/bookings/$bookingId"
				params={{ tourOperatorId, bookingId: row.original.id }}
				className="font-mono"
			>
				{row.original.reference}
			</AppResourceLink>
		),
	},
	{
		id: "experienceId",
		accessorKey: "experienceId",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.experience()}
				headerContext={ctx}
				allowFiltering="setAsync"
				endpoint={`/tour-operators/${tourOperatorId}/experiences`}
				queryKey={queryKeys.experiences(tourOperatorId)}
			/>
		),
		cell: ({ row }) => row.original.experienceName,
	},
	{
		id: "startAt",
		accessorKey: "startAt",
		header: () => <span>{m.departure()}</span>,
		cell: ({ row }) => formatSlotDateTime(row.original.startAt),
	},
	{
		id: "customer",
		header: () => <span>{m.customer()}</span>,
		cell: ({ row }) => row.original.customer.name,
	},
	{
		id: "pickup",
		header: () => <span>{m.pickup_location()}</span>,
		cell: ({ row }) => row.original.pickup?.name ?? <EmptyValue />,
	},
	{
		id: "partySize",
		header: () => <span className="block text-right">{m.party_size()}</span>,
		cell: ({ row }) => (
			<span className="block text-right tabular-nums">
				{row.original.partySize}
			</span>
		),
	},
	{
		id: "totalAmount",
		header: () => <span className="block text-right">{m.total()}</span>,
		cell: ({ row }) => money(row.original.totalAmount, currency),
	},
	{
		id: "status",
		accessorKey: "status",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.status()}
				headerContext={ctx}
				allowFiltering="set"
				items={BOOKING_STATUS_OPTIONS}
			/>
		),
		cell: ({ row }) => (
			<AppBadge variant="success">
				{bookingStatusLabel(row.original.status)}
			</AppBadge>
		),
	},
];
