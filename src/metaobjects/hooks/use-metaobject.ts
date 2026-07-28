import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { Metaobject } from "../types";

// A single entry with every definition field (value null when unset).
export const useMetaobject = (tourOperatorId: string, metaobjectId: string) =>
	useQuery({
		queryKey: queryKeys.metaobject(tourOperatorId, metaobjectId),
		queryFn: async () => {
			const { data } = await authApi.get<Metaobject>(
				`/tour-operators/${tourOperatorId}/metaobjects/${metaobjectId}`,
			);
			return data;
		},
	});
