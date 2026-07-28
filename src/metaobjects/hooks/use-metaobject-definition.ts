import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { MetaobjectDefinition } from "../types";

// A single definition with its ordered fields. Any member; cross-tenant → 404.
export const useMetaobjectDefinition = (
	tourOperatorId: string,
	definitionId: string,
) =>
	useQuery({
		queryKey: queryKeys.metaobjectDefinition(tourOperatorId, definitionId),
		queryFn: async () => {
			const { data } = await authApi.get<MetaobjectDefinition>(
				`/tour-operators/${tourOperatorId}/metaobject-definitions/${definitionId}`,
			);
			return data;
		},
	});
