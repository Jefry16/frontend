import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppPickupLocationForm } from "#/pickup-locations";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/pickup-locations/new",
)({
	component: NewPickupLocationPage,
});

// Single-resource page → centered at max-w-3xl. Static "new" wins over the
// dynamic $pickupLocationId sibling.
function NewPickupLocationPage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
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
			{canWrite ? (
				<AppPickupLocationForm tourOperatorId={tourOperatorId} />
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
