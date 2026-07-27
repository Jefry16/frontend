import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { MetafieldDefinition } from "../types";

// A single definition. Any member; cross-tenant id → 404.
export const useMetafieldDefinition = (
	tourOperatorId: string,
	definitionId: string,
) =>
	useQuery({
		queryKey: queryKeys.metafieldDefinition(tourOperatorId, definitionId),
		queryFn: async () => {
			const { data } = await authApi.get<MetafieldDefinition>(
				`/tour-operators/${tourOperatorId}/metafield-definitions/${definitionId}`,
			);
			return data;
		},
	});
