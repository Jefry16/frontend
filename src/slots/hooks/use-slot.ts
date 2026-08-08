import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { Slot } from "../types";

// A single slot with its pricing (GET /tour-operators/{id}/slots/{slotId}).
// Any member may read it; a missing or cross-tenant id is a 404.
export const useSlot = (tourOperatorId: string, slotId: string) =>
	useResource<Slot>(
		queryKeys.slot(tourOperatorId, slotId),
		`/tour-operators/${tourOperatorId}/slots/${slotId}`,
	);
