import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { Slot } from "../types";

// A single slot with its pricing (GET /tour-operators/{id}/slots/{slotId}).
// Any member may read it; a missing or cross-tenant id is a 404.
export const useSlot = (tourOperatorId: string, slotId: string) =>
	useQuery({
		queryKey: queryKeys.slot(tourOperatorId, slotId),
		queryFn: async () => {
			const { data } = await authApi.get<Slot>(
				`/tour-operators/${tourOperatorId}/slots/${slotId}`,
			);
			return data;
		},
	});
