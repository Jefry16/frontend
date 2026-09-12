import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppPickupLocationForm } from "#/pickup-locations";
import { AppWriteGate } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/pickup-locations/new",
)({
	component: NewPickupLocationPage,
});

function NewPickupLocationPage() {
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
			<AppWriteGate>
				<AppPickupLocationForm tourOperatorId={tourOperatorId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
