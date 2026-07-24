import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { Language } from "../types";

// The platform language allowlist (`reference.languages`) — the source of truth
// for which content languages an operator may offer. The Languages settings
// picker builds its options from this, so trimming/growing the allowlist
// server-side changes the picker without a frontend release.
export const useLanguages = () =>
	useQuery({
		queryKey: queryKeys.languages,
		queryFn: async () => {
			const { data } = await authApi.get<Language[]>("/languages");
			return data;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});
