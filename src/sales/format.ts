import * as m from "#/paraglide/messages";
import type { BookingStatus } from "./types";

const STATUS_LABELS: Record<BookingStatus, () => string> = {
	CONFIRMED: m.booking_status_confirmed,
};

export const bookingStatusLabel = (status: BookingStatus): string =>
	STATUS_LABELS[status]();

export const BOOKING_STATUS_OPTIONS = (
	Object.keys(STATUS_LABELS) as BookingStatus[]
).map((value) => ({ value, label: bookingStatusLabel(value) }));
