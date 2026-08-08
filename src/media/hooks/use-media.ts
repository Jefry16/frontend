import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { MediaAsset } from "../types";

// A single media asset (GET /tour-operators/{id}/media/{mediaId}). Any member
// may read it; a missing or cross-tenant id is a 404.
export const useMedia = (tourOperatorId: string, mediaId: string) =>
	useResource<MediaAsset>(
		queryKeys.mediaAsset(tourOperatorId, mediaId),
		`/tour-operators/${tourOperatorId}/media/${mediaId}`,
	);
