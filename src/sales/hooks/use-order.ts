import { useResource } from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import type { Order } from "../types";

export const useOrder = (tourOperatorId: string, orderId: string) =>
	useResource<Order>(
		queryKeys.order(tourOperatorId, orderId),
		`/tour-operators/${tourOperatorId}/orders/${orderId}`,
	);
