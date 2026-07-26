import { MapPin } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { usePickupLocation } from "../hooks/use-pickup-location";
import { AppPickupLocationForm } from "./AppPickupLocationForm";

// The pickup-location edit page: fetches the record, renders the form pre-filled.
export const AppPickupLocationEdit = ({
	tourOperatorId,
	pickupLocationId,
}: {
	tourOperatorId: string;
	pickupLocationId: string;
}) => {
	const query = usePickupLocation(tourOperatorId, pickupLocationId);

	return (
		<AppResourceView
			query={query}
			resource={m.pickup_location()}
			icon={MapPin}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.catalog() }, { label: m.pickup_locations() }]}
				/>
			}
			loading={
				<Card>
					<CardContent className="flex flex-col gap-4">
						{["a", "b", "c"].map((k) => (
							<Skeleton key={k} className="h-9 w-full" />
						))}
					</CardContent>
				</Card>
			}
		>
			{(pickup) => (
				<>
					<AppPageHeader
						title={m.edit_pickup_location()}
						breadcrumb={
							<AppBreadcrumb
								items={[
									{ label: m.catalog() },
									{
										label: m.pickup_locations(),
										to: "/tour-operators/$tourOperatorId/pickup-locations",
										params: { tourOperatorId },
									},
									{
										label: pickup.name,
										to: "/tour-operators/$tourOperatorId/pickup-locations/$pickupLocationId",
										params: { tourOperatorId, pickupLocationId },
									},
									{ label: m.edit() },
								]}
							/>
						}
					/>
					<AppPickupLocationForm
						tourOperatorId={tourOperatorId}
						pickup={pickup}
					/>
				</>
			)}
		</AppResourceView>
	);
};
