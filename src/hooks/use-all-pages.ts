import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { authApi } from "#/lib/api";

// Loads EVERY page of a cursor-paginated list endpoint and returns the flat
// rows. Safe for bounded catalogs (audiences, experiences); an unbounded list
// needs server-side search instead. `isPending` stays true until the last page
// has landed, so consumers never see a partial catalog.
export const useAllPages = <T>(
	queryKey: readonly unknown[],
	endpoint: string,
) => {
	const {
		data,
		isPending,
		isError,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: [...queryKey, "all-pages"],
		queryFn: async ({ pageParam }) => {
			const url = pageParam
				? `${endpoint}?cursor=${encodeURIComponent(pageParam as string)}`
				: endpoint;
			const res = await authApi.get<{ data: T[]; nextCursor: string | null }>(
				url,
			);
			return res.data;
		},
		initialPageParam: null as string | null,
		getNextPageParam: (last) => last.nextCursor,
	});

	// Driven by the cursor rather than by `hasNextPage`, because a boolean that
	// returns to a value it already held is not a change React can see: between
	// page two and page three both flags read exactly as they did before page
	// two, the effect never re-runs, and the list stalls at two pages with
	// `isPending` stuck true. Each page carries a distinct cursor, so this fires
	// once per page — and a server that repeats one stops rather than spinning.
	const nextCursor = data?.pages.at(-1)?.nextCursor;
	useEffect(() => {
		if (nextCursor && !isFetchingNextPage) fetchNextPage();
	}, [nextCursor, isFetchingNextPage, fetchNextPage]);

	return {
		rows: data?.pages.flatMap((p) => p.data) ?? [],
		// A mid-pagination failure must surface as an error, not eternal loading.
		isPending: !isError && (isPending || hasNextPage === true),
		isError,
		refetch,
	};
};
