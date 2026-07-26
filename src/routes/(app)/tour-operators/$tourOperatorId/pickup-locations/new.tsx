import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppPickupLocationForm } from "#/pickup-locations";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/pickup-locations/new",
)({
	component: NewPickupLocationPage,
});

// Single-resource page → centered at max-w-3xl. Static "new" wins over the
// dynamic $pickupLocationId sibling.
function NewPickupLocationPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
			<AppPageHeader
				title={m.new_pickup_location()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.catalog() },
							{
								label: m.pickup_locations(),
								to: "/tour-operators/$tourOperatorId/pickup-locations",
								params: { tourOperatorId },
							},
							{ label: m.new_pickup_location() },
						]}
					/>
				}
			/>
			<AppPickupLocationForm tourOperatorId={tourOperatorId} />
		</div>
	);
}
