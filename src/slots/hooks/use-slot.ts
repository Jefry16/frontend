import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { Slot } from "../types";

// A single slot with its pricing (GET /tour-operators/{id}/slots/{slotId}).
export const useSlot = (tourOperatorId: string, slotId: string) =>
	useResource<Slot>(
		queryKeys.slot(tourOperatorId, slotId),
		`/tour-operators/${tourOperatorId}/slots/${slotId}`,
	);
