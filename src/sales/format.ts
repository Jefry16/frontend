import * as m from "#/paraglide/messages";
import type { BookingFeeBearer, BookingStatus } from "./types";

const STATUS_LABELS: Record<BookingStatus, () => string> = {
	CONFIRMED: m.booking_status_confirmed,
};

export const bookingStatusLabel = (status: BookingStatus): string =>
	STATUS_LABELS[status]();

export const BOOKING_STATUS_OPTIONS = (
	Object.keys(STATUS_LABELS) as BookingStatus[]
).map((value) => ({ value, label: bookingStatusLabel(value) }));

const BEARER_LABELS: Record<BookingFeeBearer, () => string> = {
	CUSTOMER: m.fee_bearer_customer,
	OPERATOR: m.fee_bearer_operator,
};

export const feeBearerLabel = (bearer: BookingFeeBearer): string =>
	BEARER_LABELS[bearer]();
