import { createFileRoute } from "@tanstack/react-router";
import { AppPickupLocationEdit } from "#/pickup-locations";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/pickup-locations/$pickupLocationId/edit",
)({
	component: EditPickupLocationPage,
});

// Single-resource page → centered at max-w-3xl.
function EditPickupLocationPage() {
	const { tourOperatorId, pickupLocationId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
			<AppPickupLocationEdit
				tourOperatorId={tourOperatorId}
				pickupLocationId={pickupLocationId}
			/>
		</div>
	);
}
