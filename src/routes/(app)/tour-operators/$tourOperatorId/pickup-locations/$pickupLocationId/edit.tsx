import { createFileRoute } from "@tanstack/react-router";
import { AppPickupLocationEdit } from "#/pickup-locations";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { AppWriteGate } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/pickup-locations/$pickupLocationId/edit",
)({
	component: EditPickupLocationPage,
});

function EditPickupLocationPage() {
	const { tourOperatorId, pickupLocationId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
				<AppPickupLocationEdit
					tourOperatorId={tourOperatorId}
					pickupLocationId={pickupLocationId}
				/>
			</AppWriteGate>
		</AppPageShell>
	);
}
