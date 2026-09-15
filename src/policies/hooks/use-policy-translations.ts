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

export const usePolicyTranslation = (
	tourOperatorId: string,
	policyId: string,
	locale: string | undefined,
) =>
	useQuery({
		queryKey: queryKeys.policyTranslation(
			tourOperatorId,
			policyId,
			locale ?? "",
		),
		enabled: !!locale,
		queryFn: async () => {
			const { data } = await authApi.get<PolicyTranslation>(
				`/tour-operators/${tourOperatorId}/policies/${policyId}/translations/${locale}`,
			);
			return data;
		},
	});
