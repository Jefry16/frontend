import { useResource } from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import type { Slot } from "../types";

export const useSlot = (tourOperatorId: string, slotId: string) =>
	useResource<Slot>(
		queryKeys.slot(tourOperatorId, slotId),
		`/tour-operators/${tourOperatorId}/slots/${slotId}`,
	);
