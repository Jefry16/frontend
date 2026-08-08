import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { Audience } from "../types";

// A single audience (GET /tour-operators/{id}/audiences/{audienceId}). Any
// member may read it; a missing or cross-tenant id is a 404.
export const useAudience = (tourOperatorId: string, audienceId: string) =>
	useResource<Audience>(
		queryKeys.audience(tourOperatorId, audienceId),
		`/tour-operators/${tourOperatorId}/audiences/${audienceId}`,
	);
