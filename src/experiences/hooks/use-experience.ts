import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { Experience } from "../types";

export const useExperience = (tourOperatorId: string, experienceId: string) =>
	useResource<Experience>(
		queryKeys.experience(tourOperatorId, experienceId),
		`/tour-operators/${tourOperatorId}/experiences/${experienceId}`,
	);
