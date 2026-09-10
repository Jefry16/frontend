import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";

export const useUiLanguages = () =>
	useQuery({
		queryKey: queryKeys.uiLanguages,
		queryFn: async () => {
			const { data } = await authApi.get<string[]>("/ui-languages");
			return data;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});
