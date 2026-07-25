import { createFileRoute } from "@tanstack/react-router";
import { AppPickupLocationDetail } from "#/pickup-locations";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/pickup-locations/$pickupLocationId/",
)({
	component: PickupLocationDetailPage,
});

// Single-resource page → centered at max-w-3xl (list pages go full width).
function PickupLocationDetailPage() {
	const { tourOperatorId, pickupLocationId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
			<AppPickupLocationDetail
				tourOperatorId={tourOperatorId}
				pickupLocationId={pickupLocationId}
			/>
		</div>
	);
}
