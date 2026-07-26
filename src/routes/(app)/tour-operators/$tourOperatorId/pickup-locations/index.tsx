import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "#/components/ui/button";
import * as m from "#/paraglide/messages";
import { AppPickupLocationsList } from "#/pickup-locations";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppLink } from "#/shared/components/AppLink";
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
				actions={
					<Button asChild>
						<AppLink
							to="/tour-operators/$tourOperatorId/pickup-locations/new"
							params={{ tourOperatorId }}
						>
							<Plus />
							{m.new_pickup_location()}
						</AppLink>
					</Button>
				}
			/>
			<AppPickupLocationsList tourOperatorId={tourOperatorId} />
		</div>
	);
}
