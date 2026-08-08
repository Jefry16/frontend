import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { PolicyTranslation } from "../types";

/**
 * Every locale that carries an overlay — drives the switcher's dots AND seeds
 * each locale's form. Unlike the page and experience editors there is no
 * per-locale GET on this resource, so the list is the only read.
 */
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
