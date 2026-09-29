import type { ColumnDef } from "@tanstack/react-table";
import {
	AppDataTableHeader,
	type AppStaticTableColumn,
	EmptyValue,
	formatMoney,
	timestampColumn,
} from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import { AppResourceLink } from "#/shared/links";
import { formatSlotDateTime } from "#/slots";
import { AppBookingStatusBadge } from "./components/AppBookingStatusBadge";
import { BOOKING_STATUS_OPTIONS } from "./format";
import type { BookingLine, BookingManifestItem, OrderListItem } from "./types";

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
		id: "totalPrice",
		accessorKey: "totalPrice",
		header: () => <span className="block text-right">{m.total()}</span>,
		cell: ({ row }) => money(row.original.totalPrice, row.original.currency),
	},
	timestampColumn<OrderListItem>("placedAt", m.placed(), formatDateTime),
];

export const bookingColumns = (
	tourOperatorId: string,
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
		id: "totalPrice",
		header: () => <span className="block text-right">{m.total()}</span>,
		cell: ({ row }) => money(row.original.totalPrice, row.original.currency),
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
		cell: ({ row }) => <AppBookingStatusBadge status={row.original.status} />,
	},
];

export interface PricedBookingLine extends BookingLine {
	price: number;
}

export const pricedLines = (lines: BookingLine[]): PricedBookingLine[] =>
	lines.map((line) => ({ ...line, price: line.unitPrice }));

// What a booking's line knows beyond the audience and its price: the
// AppAudiencePriceTable's own two columns open every table these follow.
export const bookingLineColumns = (
	currency: string | null,
	locale: string,
): AppStaticTableColumn<PricedBookingLine>[] => [
	{
		id: "quantity",
		header: m.quantity(),
		cell: (line) => line.quantity,
		numeric: true,
	},
	{
		id: "pickupPrice",
		header: m.pickup_price(),
		cell: (line) => formatMoney(line.pickupUnitPrice, currency, locale),
		numeric: true,
	},
	{
		id: "subtotal",
		header: m.subtotal(),
		cell: (line) =>
			formatMoney(
				line.quantity * (line.unitPrice + line.pickupUnitPrice),
				currency,
				locale,
			),
		numeric: true,
	},
];
