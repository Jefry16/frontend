import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { Country } from "../types";

// The full country list, for the operator's postal address. Reference data, so
// it never goes stale within a session — the list is ~250 rows and the address
// form needs all of them.
export const useCountries = () =>
	useQuery({
		queryKey: queryKeys.countries,
		queryFn: async () => {
			const { data } = await authApi.get<Country[]>("/countries");
			return data;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});
