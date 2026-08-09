import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppPickupLocationsList } from "#/pickup-locations";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/pickup-locations/",
)({
	component: PickupLocationsPage,
});

function PickupLocationsPage() {
	const { tourOperatorId } = Route.useParams();
	const { canWrite } = usePermissions();

	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.pickup_locations()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.catalog() }, { label: m.pickup_locations() }]}
					/>
				}
				actions={
					canWrite && (
						<AppNewLink
							to="/tour-operators/$tourOperatorId/pickup-locations/new"
							params={{ tourOperatorId }}
						>
							{m.new_pickup_location()}
						</AppNewLink>
					)
				}
			/>
			<AppPickupLocationsList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
