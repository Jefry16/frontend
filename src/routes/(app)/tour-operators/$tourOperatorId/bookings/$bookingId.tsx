import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppBookingDetail } from "#/sales";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/bookings/$bookingId",
)({
	component: BookingPage,
});

function BookingPage() {
	const { tourOperatorId, bookingId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppBookingDetail tourOperatorId={tourOperatorId} bookingId={bookingId} />
		</AppPageShell>
	);
}
