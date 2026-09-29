import { AppBadge } from "@vointika/ui";
import { bookingStatusLabel, bookingStatusVariant } from "../format";
import type { BookingStatus } from "../types";

export const AppBookingStatusBadge = ({
	status,
}: {
	status: BookingStatus;
}) => (
	<AppBadge variant={bookingStatusVariant(status)}>
		{bookingStatusLabel(status)}
	</AppBadge>
);
