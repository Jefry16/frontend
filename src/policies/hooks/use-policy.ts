import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { Policy } from "../types";

// One policy with its body. Any member; an id from another operator → 404,
// because the backend binds the id to the tenant in the path.
export const usePolicy = (tourOperatorId: string, policyId: string) =>
	useQuery({
		queryKey: queryKeys.policy(tourOperatorId, policyId),
		queryFn: async () => {
			const { data } = await authApi.get<Policy>(
				`/tour-operators/${tourOperatorId}/policies/${policyId}`,
			);
			return data;
		},
	});
