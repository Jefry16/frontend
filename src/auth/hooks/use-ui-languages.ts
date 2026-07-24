import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";

// The supported admin-UI languages (GET /ui-languages → bare locale codes). The
// source of truth for the interface-language picker; the backend allowlist and
// the compiled Paraglide catalogs are grown together, so this drives the picker
// without a frontend release.
export const useUiLanguages = () =>
	useQuery({
		queryKey: queryKeys.uiLanguages,
		queryFn: async () => {
			const { data } = await authApi.get<string[]>("/ui-languages");
			return data;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});
