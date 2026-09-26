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
import { Ticket } from "lucide-react";
import * as m from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import { useOperatorCurrency } from "#/session";
import { AppBackLink, AppBreadcrumb, AppResourceLink } from "#/shared/links";
import { formatSlotDateTime } from "#/slots";
import { bookingStatusLabel } from "../format";
import { useBooking } from "../hooks/use-booking";
import type { BookingLine, BookingManifestItem } from "../types";

interface PricedLine extends BookingLine {
	price: number;
}

const lineColumns = (
	currency: string | null,
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

export const AppBookingDetail = ({
	tourOperatorId,
	bookingId,
}: {
	tourOperatorId: string;
	bookingId: string;
}) => {
	const query = useBooking(tourOperatorId, bookingId);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/bookings"
			params={{ tourOperatorId }}
		>
			{m.back_to_bookings()}
		</AppBackLink>
	);

	return (
		<AppResourceView
			query={query}
			resource={m.booking()}
			icon={Ticket}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.operations() }, { label: m.bookings() }]}
				/>
			}
			notFoundAction={backLink}
			loading={<AppDetailSkeleton fields={4} />}
		>
			{(booking) => (
				<BookingView tourOperatorId={tourOperatorId} booking={booking} />
			)}
		</AppResourceView>
	);
};

const BookingView = ({
	tourOperatorId,
	booking,
}: {
	tourOperatorId: string;
	booking: BookingManifestItem;
}) => {
	const currency = useOperatorCurrency();
	const locale = getLocale();

	return (
		<>
			<AppPageHeader
				title={booking.reference}
				description={booking.experienceName}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.operations() },
							{
								label: m.bookings(),
								to: "/tour-operators/$tourOperatorId/bookings",
								params: { tourOperatorId },
							},
							{ label: booking.reference },
						]}
					/>
				}
			/>

			<AppCard
				title={m.departure()}
				action={
					<AppBadge variant="success">
						{bookingStatusLabel(booking.status)}
					</AppBadge>
				}
			>
				<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<AppDetailField label={m.experience()}>
						<AppResourceLink
							to="/tour-operators/$tourOperatorId/experiences/$experienceId"
							params={{ tourOperatorId, experienceId: booking.experienceId }}
						>
							{booking.experienceName}
						</AppResourceLink>
					</AppDetailField>
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
				</dl>
			</AppCard>

			<AppCard title={m.customer()}>
				<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<AppDetailField label={m.name()}>
						{booking.customer.name}
					</AppDetailField>
					<AppDetailField label={m.email()}>
						<a href={`mailto:${booking.customer.email}`}>
							{booking.customer.email}
						</a>
					</AppDetailField>
					<AppDetailField label={m.phone()}>
						{booking.customer.phone ? (
							<a href={`tel:${booking.customer.phone}`}>
								{booking.customer.phone}
							</a>
						) : (
							<EmptyValue />
						)}
					</AppDetailField>
					<AppDetailField label={m.customer_notes()}>
						{booking.customer.detail ?? <EmptyValue />}
					</AppDetailField>
					<AppDetailField label={m.order()}>
						<AppResourceLink
							to="/tour-operators/$tourOperatorId/orders/$orderId"
							params={{ tourOperatorId, orderId: booking.orderId }}
						>
							{m.view_order()}
						</AppResourceLink>
					</AppDetailField>
				</dl>
			</AppCard>

			<AppCard title={m.total()} className="flex flex-col gap-4">
				<AppAudiencePriceTable
					rows={booking.lines.map((line) => ({
						...line,
						price: line.unitPrice,
					}))}
					currency={currency}
					columns={lineColumns(currency, locale)}
				/>
				<dl className="grid grid-cols-2 gap-4">
					<AppDetailField label={m.total()}>
						{formatMoney(booking.totalAmount, currency, locale)}
					</AppDetailField>
				</dl>
			</AppCard>
		</>
	);
};
