import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { OperatorLocales } from "../locales";

interface OperatorDetailSlice {
	locales: OperatorLocales;
}

export const useOperatorLocales = (tourOperatorId: string) =>
	useQuery({
		queryKey: queryKeys.operatorDetails(tourOperatorId),
		queryFn: async () => {
			const { data } = await authApi.get<OperatorDetailSlice>(
				`/tour-operators/${tourOperatorId}`,
			);
			return data;
		},
		select: (data) => data.locales,
	});
