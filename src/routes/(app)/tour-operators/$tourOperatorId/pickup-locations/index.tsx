import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppPickupLocationsList } from "#/pickup-locations";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/pickup-locations/",
)({
	component: PickupLocationsPage,
});

// Pickup locations: the operator's meeting-point catalog. Table page → full width.
function PickupLocationsPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<div className="flex flex-col gap-6 p-6">
			<AppPageHeader
				title={m.pickup_locations()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.catalog() }, { label: m.pickup_locations() }]}
					/>
				}
			/>
			<AppPickupLocationsList tourOperatorId={tourOperatorId} />
		</div>
	);
}
