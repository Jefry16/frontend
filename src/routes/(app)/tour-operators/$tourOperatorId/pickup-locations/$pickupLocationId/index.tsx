import { createFileRoute } from "@tanstack/react-router";
import { AppPickupLocationDetail } from "#/pickup-locations";
import { AppPageShell } from "#/shared/components/AppPageShell";

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
