import { AppFormSkeleton, AppPageHeader, AppResourceView } from "@vointika/ui";
import { MapPin } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { usePickupLocation } from "../hooks/use-pickup-location";
import { AppPickupLocationForm } from "./AppPickupLocationForm";

export const AppPickupLocationEdit = ({
	tourOperatorId,
	pickupLocationId,
}: {
	tourOperatorId: string;
	pickupLocationId: string;
}) => {
	const query = usePickupLocation(tourOperatorId, pickupLocationId);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/pickup-locations"
			params={{ tourOperatorId }}
		>
			{m.back_to_pickup_locations()}
		</AppBackLink>
	);
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
			notFoundAction={backLink}
			loading={<AppFormSkeleton rows={3} />}
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
