import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { PickupLocation } from "../types";

export const usePickupLocation = (
	tourOperatorId: string,
	pickupLocationId: string,
) =>
	useResource<PickupLocation>(
		queryKeys.pickupLocation(tourOperatorId, pickupLocationId),
		`/tour-operators/${tourOperatorId}/pickup-locations/${pickupLocationId}`,
	);
