import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { OperatorLocales } from "../locales";

// The operator's content languages (primary + supported set). Member-visible;
// the summary on the profile doesn't carry locales, so this is the fetch behind
// the Languages settings page.
export const useOperatorLocales = (tourOperatorId: string) =>
	useQuery({
		queryKey: queryKeys.operatorLocales(tourOperatorId),
		queryFn: async () => {
			const { data } = await authApi.get<OperatorLocales>(
				`/tour-operators/${tourOperatorId}/locales`,
			);
			return data;
		},
	});
