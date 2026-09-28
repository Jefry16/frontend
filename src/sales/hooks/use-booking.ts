import { useResource } from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import type { BookingManifestItem } from "../types";

export const useBooking = (tourOperatorId: string, bookingId: string) =>
	useResource<BookingManifestItem>(
		queryKeys.booking(tourOperatorId, bookingId),
		`/tour-operators/${tourOperatorId}/bookings/${bookingId}`,
	);
