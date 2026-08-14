import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { MediaAsset } from "../types";

// A single media asset (GET /tour-operators/{id}/media/{mediaId}). Any member
// may read it; a missing or cross-tenant id is a 404.
//
// `mediaId` is nullable because most callers point at an OPTIONAL slot — a
// brand image, the og:image — where "not set" is a normal state and not a
// request worth making. `tour-operator` carried two byte-identical private
// copies of this for exactly that shape, back when importing `#/media` from
// there was a cycle; it no longer is.
export const useMedia = (tourOperatorId: string, mediaId: string | null) =>
	useQuery({
		queryKey: queryKeys.mediaAsset(tourOperatorId, mediaId ?? ""),
		enabled: !!mediaId,
		queryFn: async () => {
			const { data } = await authApi.get<MediaAsset>(
				`/tour-operators/${tourOperatorId}/media/${mediaId}`,
			);
			return data;
		},
	});
