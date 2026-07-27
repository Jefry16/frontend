import { MapPin } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { useOperatorDateTime } from "#/tour-operator";
import { pickupLocationColumns } from "../columns";

// The operator's pickup locations (meeting points) as the standard
// cursor-paginated table: name searchable, time + createdAt sortable.
export const AppPickupLocationsList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const columns = useMemo(
		() => pickupLocationColumns(tourOperatorId, formatDate),
		[tourOperatorId, formatDate],
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
				action: (
					<AppNewLink
						to="/tour-operators/$tourOperatorId/pickup-locations/new"
						params={{ tourOperatorId }}
					>
						{m.new_pickup_location()}
					</AppNewLink>
				),
			}}
		/>
	);
};
