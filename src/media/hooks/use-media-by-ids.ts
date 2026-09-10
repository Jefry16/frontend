import { useQueries } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { MediaAsset } from "../types";

export const useMediaByIds = (tourOperatorId: string, ids: string[]) => {
	const results = useQueries({
		queries: ids.map((id) => ({
			queryKey: queryKeys.mediaAsset(tourOperatorId, id),
			queryFn: async () => {
				const { data } = await authApi.get<MediaAsset>(
					`/tour-operators/${tourOperatorId}/media/${id}`,
				);
				return data;
			},
			staleTime: Number.POSITIVE_INFINITY,
			retry: false,
		})),
	});

	const byId = new Map<string, MediaAsset>();
	ids.forEach((id, i) => {
		const asset = results[i]?.data;
		if (asset) byId.set(id, asset);
	});

	return { byId, isLoading: results.some((r) => r.isLoading) };
};
