import { MapPin } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { useCurrentTourOperator } from "#/tour-operator";
import { pickupLocationColumns } from "../columns";

// The operator's pickup locations (meeting points) as the standard
// cursor-paginated table: name searchable, time + createdAt sortable.
export const AppPickupLocationsList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const timeZone = useCurrentTourOperator()?.timezone;
	const columns = useMemo(
		() => pickupLocationColumns(tourOperatorId, timeZone),
		[tourOperatorId, timeZone],
	);

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/pickup-locations`}
			queryKey={queryKeys.pickupLocations(tourOperatorId)}
			emptyState={{
				icon: MapPin,
				title: m.no_pickup_locations(),
				description: m.no_pickup_locations_body(),
			}}
		/>
	);
};
