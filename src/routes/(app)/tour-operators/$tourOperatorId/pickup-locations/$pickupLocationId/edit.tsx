import { createFileRoute } from "@tanstack/react-router";
import { AppPickupLocationEdit } from "#/pickup-locations";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/pickup-locations/$pickupLocationId/edit",
)({
	component: EditPickupLocationPage,
});

// Single-resource page → centered at max-w-3xl.
function EditPickupLocationPage() {
	const { tourOperatorId, pickupLocationId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppPickupLocationEdit
				tourOperatorId={tourOperatorId}
				pickupLocationId={pickupLocationId}
			/>
		</AppPageShell>
	);
}
