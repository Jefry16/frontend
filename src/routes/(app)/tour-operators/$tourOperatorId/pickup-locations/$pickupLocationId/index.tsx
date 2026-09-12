import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppPickupLocationDetail } from "#/pickup-locations";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/pickup-locations/$pickupLocationId/",
)({
	component: PickupLocationDetailPage,
});

function PickupLocationDetailPage() {
	const { tourOperatorId, pickupLocationId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppPickupLocationDetail
				tourOperatorId={tourOperatorId}
				pickupLocationId={pickupLocationId}
			/>
		</AppPageShell>
	);
}
