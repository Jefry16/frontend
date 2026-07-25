import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { Audience } from "../types";

// A single audience (GET /tour-operators/{id}/audiences/{audienceId}). Any
// member may read it; a missing or cross-tenant id is a 404.
export const useAudience = (tourOperatorId: string, audienceId: string) =>
	useQuery({
		queryKey: queryKeys.audience(tourOperatorId, audienceId),
		queryFn: async () => {
			const { data } = await authApi.get<Audience>(
				`/tour-operators/${tourOperatorId}/audiences/${audienceId}`,
			);
			return data;
		},
	});
