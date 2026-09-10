import { QueryClient } from "@tanstack/react-query";

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

export const listPage = <T>(data: T[]) => ({
	pages: [{ data, nextCursor: null }],
	pageParams: [null] as (string | null)[],
});
