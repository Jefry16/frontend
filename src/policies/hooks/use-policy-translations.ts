import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { PolicyTranslation } from "../types";

export const usePolicyTranslations = (
	tourOperatorId: string,
	policyId: string,
) =>
	useQuery({
		queryKey: queryKeys.policyTranslations(tourOperatorId, policyId),
		queryFn: async () => {
			const { data } = await authApi.get<PolicyTranslation[]>(
				`/tour-operators/${tourOperatorId}/policies/${policyId}/translations`,
			);
			return data;
		},
	});
