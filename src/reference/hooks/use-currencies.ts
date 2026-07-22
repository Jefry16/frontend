import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { Currency } from "../types";

export const useCurrencies = () =>
	useQuery({
		queryKey: queryKeys.currencies,
		queryFn: async () => {
			const { data } = await authApi.get<Currency[]>("/currencies");
			return data;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});
