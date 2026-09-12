import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import { isLocale, type Locale } from "#/paraglide/runtime";

export const useUiLanguages = () =>
	useQuery({
		queryKey: queryKeys.uiLanguages,
		queryFn: async () => {
			const { data } = await authApi.get<string[]>("/ui-languages");
			return data;
		},
		select: (codes): Locale[] => codes.filter(isLocale),
		staleTime: Number.POSITIVE_INFINITY,
	});
