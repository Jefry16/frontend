import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppPickupLocationEdit } from "#/pickup-locations";
import { AppWriteGate } from "#/session";

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
