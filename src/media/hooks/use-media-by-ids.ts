import { useQueries } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { MediaAsset } from "../types";

// Resolves a set of media ids to their assets (url + name) for display — the
// robust way to map a selection's ids to previews, since the experience's
// resolved galleryUrls drop deleted ids and so aren't 1:1 with mediaIds. Shares
// the per-id cache with useMedia; a deleted id 404s (retry:false) and simply
// doesn't appear in the map, so the caller can flag it as missing.
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
