import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { Audience } from "../types";

export const useAudience = (tourOperatorId: string, audienceId: string) =>
	useResource<Audience>(
		queryKeys.audience(tourOperatorId, audienceId),
		`/tour-operators/${tourOperatorId}/audiences/${audienceId}`,
	);
