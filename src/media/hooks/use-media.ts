import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { MediaAsset } from "../types";

// A single media asset (GET /tour-operators/{id}/media/{mediaId}). Any member
// may read it; a missing or cross-tenant id is a 404.
export const useMedia = (tourOperatorId: string, mediaId: string) =>
	useQuery({
		queryKey: queryKeys.mediaAsset(tourOperatorId, mediaId),
		queryFn: async () => {
			const { data } = await authApi.get<MediaAsset>(
				`/tour-operators/${tourOperatorId}/media/${mediaId}`,
			);
			return data;
		},
	});
