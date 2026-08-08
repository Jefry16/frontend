import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { PickupLocation } from "../types";

// A single pickup location (GET .../pickup-locations/{id}). Any member may read
// it; a missing or cross-tenant id is a 404.
export const usePickupLocation = (
	tourOperatorId: string,
	pickupLocationId: string,
) =>
	useResource<PickupLocation>(
		queryKeys.pickupLocation(tourOperatorId, pickupLocationId),
		`/tour-operators/${tourOperatorId}/pickup-locations/${pickupLocationId}`,
	);
