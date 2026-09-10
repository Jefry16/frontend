import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { Language } from "../types";

export const useLanguages = () =>
	useQuery({
		queryKey: queryKeys.languages,
		queryFn: async () => {
			const { data } = await authApi.get<Language[]>("/languages");
			return data;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});
