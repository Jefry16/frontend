import { useResource } from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import type { Policy } from "../types";

export const usePolicy = (tourOperatorId: string, policyId: string) =>
	useResource<Policy>(
		queryKeys.policy(tourOperatorId, policyId),
		`/tour-operators/${tourOperatorId}/policies/${policyId}`,
	);
