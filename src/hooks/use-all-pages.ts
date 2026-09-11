import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";

const FRESH_FOR = 60_000;

interface Page<T> {
	data: T[];
	nextCursor: string | null;
}

export const allPagesKey = (queryKey: readonly unknown[], endpoint: string) =>
	[...queryKey, "all-pages", endpoint] as const;

export const useAllPages = <T>(
	queryKey: readonly unknown[],
	endpoint: string,
	{ enabled = true }: { enabled?: boolean } = {},
) =>
	useQuery({
		enabled,
		staleTime: FRESH_FOR,
		queryKey: allPagesKey(queryKey, endpoint),
		queryFn: async ({ signal }) => {
			const rows: T[] = [];
			const seen = new Set<string>();
			let cursor: string | null = null;
			do {
				const join = endpoint.includes("?") ? "&" : "?";
				const url: string = cursor
					? `${endpoint}${join}cursor=${encodeURIComponent(cursor)}`
					: endpoint;
				const page: Page<T> = (await authApi.get<Page<T>>(url, { signal }))
					.data;
				rows.push(...page.data);
				cursor = page.nextCursor || null;
				if (cursor && seen.has(cursor)) break;
				if (cursor) seen.add(cursor);
			} while (cursor);
			return rows;
		},
	});
