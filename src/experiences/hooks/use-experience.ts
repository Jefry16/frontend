import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { Experience } from "../types";

// A single experience (GET /tour-operators/{id}/experiences/{experienceId}).
// Any member may read it; a missing or cross-tenant id is a 404.
export const useExperience = (tourOperatorId: string, experienceId: string) =>
	useQuery({
		queryKey: queryKeys.experience(tourOperatorId, experienceId),
		queryFn: async () => {
			const { data } = await authApi.get<Experience>(
				`/tour-operators/${tourOperatorId}/experiences/${experienceId}`,
			);
			return data;
		},
	});
