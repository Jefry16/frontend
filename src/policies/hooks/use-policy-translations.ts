import { useQuery } from "@tanstack/react-query";
import type { QueryState } from "@vointika/ui";
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

/**
 * PolicyTranslationController has no GET …/translations/{locale} — list, PUT
 * and DELETE only — so the overlay is read out of the list here, beside the
 * endpoint, and presented as the QueryState every other translations page gets.
 */
export const usePolicyTranslation = (
	tourOperatorId: string,
	policyId: string,
	locale: string | undefined,
): QueryState<PolicyTranslation> => {
	const listQuery = usePolicyTranslations(tourOperatorId, policyId);
	const error = listQuery.error;
	const isPending = !error && (listQuery.isPending || !locale);
	const rows = isPending || error ? undefined : listQuery.data;

	return {
		data:
			rows && locale
				? (rows.find((t) => t.locale === locale) ?? {
						locale,
						title: null,
						body: null,
					})
				: undefined,
		isPending,
		error,
		refetch: listQuery.refetch,
	};
};
