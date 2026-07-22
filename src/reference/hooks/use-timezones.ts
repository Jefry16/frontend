import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { Timezone } from "../types";

export const useTimezones = () =>
	useQuery({
		queryKey: queryKeys.timezones,
		queryFn: async () => {
			const { data } = await authApi.get<Timezone[]>("/timezones");
			return data;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});
