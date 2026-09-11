import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { authApi } from "#/lib/api";

export const useAllPages = <T>(
	queryKey: readonly unknown[],
	endpoint: string,
	{ enabled = true }: { enabled?: boolean } = {},
) => {
	const {
		data,
		isPending,
		isError,
		error,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetching,
		dataUpdatedAt,
	} = useInfiniteQuery({
		enabled,
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
		getNextPageParam: (last) => last.nextCursor || null,
	});

	const nextCursor = data?.pages.at(-1)?.nextCursor;
	// biome-ignore lint/correctness/useExhaustiveDependencies: nextCursor and dataUpdatedAt are the triggers — a page landing and a refetch settling each re-arm the drain, and neither changes a value the body reads
	useEffect(() => {
		if (hasNextPage && !isFetching) fetchNextPage();
	}, [nextCursor, dataUpdatedAt, hasNextPage, isFetching, fetchNextPage]);

	const rows = data?.pages.flatMap((p) => p.data) ?? [];
	const stillLoading = !isError && (isPending || hasNextPage === true);

	return {
		data: isError || stillLoading ? undefined : rows,
		isPending: stillLoading,
		isError,
		error,
		refetch,
	};
};
