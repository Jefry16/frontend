import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { PickupLocation } from "../types";

// A single pickup location (GET .../pickup-locations/{id}). Any member may read
// it; a missing or cross-tenant id is a 404.
export const usePickupLocation = (
	tourOperatorId: string,
	pickupLocationId: string,
) =>
	useQuery({
		queryKey: queryKeys.pickupLocation(tourOperatorId, pickupLocationId),
		queryFn: async () => {
			const { data } = await authApi.get<PickupLocation>(
				`/tour-operators/${tourOperatorId}/pickup-locations/${pickupLocationId}`,
			);
			return data;
		},
	});
