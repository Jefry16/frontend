import { QueryClient } from "@tanstack/react-query";

// Story-only: src/dev is outside the dependency-cruiser graph and never ships.

// No refetches and no retries, so a story renders exactly what was seeded.
export const storyQueryClient = (
	seed?: (qc: QueryClient) => void,
): QueryClient => {
	const qc = new QueryClient({
		defaultOptions: {
			queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
		},
	});
	seed?.(qc);
	return qc;
};

/** One page in the shape useInfiniteQuery caches. */
export const listPage = <T>(data: T[]) => ({
	pages: [{ data, nextCursor: null }],
	pageParams: [null] as (string | null)[],
});
