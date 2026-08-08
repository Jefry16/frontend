import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";

// Reads one record by id — the shape every `use-<entity>.ts` hook shares. Each
// keeps its own name, type and endpoint; this holds the part that never varies.
//
// Every by-id path is tenant-scoped (the backend binds the id to the operator
// in the URL), so a foreign id answers 404 rather than 403 — which
// notFoundAwareRetry declines to retry and AppResourceView paints as not-found.
export const useResource = <T>(queryKey: readonly unknown[], url: string) =>
	useQuery({
		queryKey,
		queryFn: async () => {
			const { data } = await authApi.get<T>(url);
			return data;
		},
	});
