import { createFileRoute } from "@tanstack/react-router";
import { AppPickupLocationEdit } from "#/pickup-locations";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/pickup-locations/$pickupLocationId/edit",
)({
	component: EditPickupLocationPage,
});

// Single-resource page → centered at max-w-3xl.
function EditPickupLocationPage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId, pickupLocationId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			{canWrite ? (
				<AppPickupLocationEdit
					tourOperatorId={tourOperatorId}
					pickupLocationId={pickupLocationId}
				/>
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
