import { QueryClient } from "@tanstack/react-query";

// Story-only helpers (src/dev is excluded from the dependency-cruiser graph
// and never ships). Not for tests or app code.

/**
 * The seeded story client: no refetches, no retries, so a story renders
 * exactly what was seeded. Pass a seeder to fill the cache:
 *
 *   const qc = storyQueryClient((qc) =>
 *     qc.setQueryData(queryKeys.audience(OP, AUD), AUDIENCE),
 *   );
 */
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

/** One fully-loaded page in the shape useInfiniteQuery caches — seed list/timeline keys with it. */
export const listPage = <T>(data: T[]) => ({
	pages: [{ data, nextCursor: null }],
	pageParams: [null] as (string | null)[],
});
