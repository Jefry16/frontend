import {
	AppAudiencePriceTable,
	AppBadge,
	AppCard,
	AppDetailField,
	AppDetailSkeleton,
	AppPageHeader,
	AppResourceView,
	type AppStaticTableColumn,
	EmptyValue,
	formatMoney,
} from "@vointika/ui";
import { ShoppingBag } from "lucide-react";
import * as m from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import { useOperatorDateTime } from "#/session";
import { AppBackLink, AppBreadcrumb, AppResourceLink } from "#/shared/links";
import { formatSlotDateTime } from "#/slots";
import { bookingStatusLabel } from "../format";
import { useOrder } from "../hooks/use-order";
import type { Booking, BookingLine, Order } from "../types";

interface PricedLine extends BookingLine {
	price: number;
}

const lineColumns = (
	currency: string,
	locale: string,
): AppStaticTableColumn<PricedLine>[] => [
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

export const AppOrderDetail = ({
	tourOperatorId,
	orderId,
}: {
	tourOperatorId: string;
	orderId: string;
}) => {
	const query = useOrder(tourOperatorId, orderId);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/orders"
			params={{ tourOperatorId }}
		>
			{m.back_to_orders()}
		</AppBackLink>
	);

	return (
		<AppResourceView
			query={query}
			resource={m.order()}
			icon={ShoppingBag}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.operations() }, { label: m.orders() }]}
				/>
			}
			notFoundAction={backLink}
			loading={<AppDetailSkeleton fields={4} />}
		>
			{(order) => <OrderView tourOperatorId={tourOperatorId} order={order} />}
		</AppResourceView>
	);
};

const OrderView = ({
	tourOperatorId,
	order,
}: {
	tourOperatorId: string;
	order: Order;
}) => {
	const { formatDateTime } = useOperatorDateTime();
	const locale = getLocale();

	return (
		<>
			<AppPageHeader
				title={order.customer.name}
				description={formatDateTime(order.placedAt)}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.operations() },
							{
								label: m.orders(),
								to: "/tour-operators/$tourOperatorId/orders",
								params: { tourOperatorId },
							},
							{ label: order.customer.name },
						]}
					/>
				}
			/>

			<AppCard title={m.customer()}>
				<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<AppDetailField label={m.email()}>
						<a href={`mailto:${order.customer.email}`}>
							{order.customer.email}
						</a>
					</AppDetailField>
					<AppDetailField label={m.phone()}>
						{order.customer.phone ? (
							<a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a>
						) : (
							<EmptyValue />
						)}
					</AppDetailField>
					<AppDetailField label={m.customer_notes()}>
						{order.customer.detail ?? <EmptyValue />}
					</AppDetailField>
					<AppDetailField label={m.total()}>
						{formatMoney(order.totalAmount, order.currency, locale)}
					</AppDetailField>
					<AppDetailField label={m.payment_reference()}>
						<span className="font-mono text-sm">{order.paymentId}</span>
					</AppDetailField>
				</dl>
			</AppCard>

			{order.bookings.map((booking) => (
				<BookingCard
					key={booking.id}
					tourOperatorId={tourOperatorId}
					booking={booking}
					currency={order.currency}
					locale={locale}
				/>
			))}
		</>
	);
};

const BookingCard = ({
	tourOperatorId,
	booking,
	currency,
	locale,
}: {
	tourOperatorId: string;
	booking: Booking;
	currency: string;
	locale: string;
}) => (
	<AppCard
		title={booking.experienceName}
		action={
			<AppBadge variant="success">
				{bookingStatusLabel(booking.status)}
			</AppBadge>
		}
		className="flex flex-col gap-4"
	>
		<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<AppDetailField label={m.departure()}>
				<AppResourceLink
					to="/tour-operators/$tourOperatorId/availability/$slotId"
					params={{ tourOperatorId, slotId: booking.slotId }}
				>
					{formatSlotDateTime(booking.startAt)}
				</AppResourceLink>
			</AppDetailField>
			<AppDetailField label={m.pickup_location()}>
				{booking.pickup ? (
					<AppResourceLink
						to="/tour-operators/$tourOperatorId/pickup-locations/$pickupLocationId"
						params={{
							tourOperatorId,
							pickupLocationId: booking.pickup.pickupLocationId,
						}}
					>
						{booking.pickup.name}
					</AppResourceLink>
				) : (
					<EmptyValue />
				)}
			</AppDetailField>
			<AppDetailField label={m.party_size()}>
				{booking.partySize}
			</AppDetailField>
			<AppDetailField label={m.total()}>
				{formatMoney(booking.totalAmount, currency, locale)}
			</AppDetailField>
		</dl>
		<AppAudiencePriceTable
			rows={booking.lines.map((line) => ({ ...line, price: line.unitPrice }))}
			currency={currency}
			columns={lineColumns(currency, locale)}
		/>
	</AppCard>
);
