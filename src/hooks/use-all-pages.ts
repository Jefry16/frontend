import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { authApi } from "#/lib/api";

export const useAllPages = <T>(
	queryKey: readonly unknown[],
	endpoint: string,
) => {
	const {
		data,
		isPending,
		isError,
		error,
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

	const nextCursor = data?.pages.at(-1)?.nextCursor;
	useEffect(() => {
		if (nextCursor && !isFetchingNextPage) fetchNextPage();
	}, [nextCursor, isFetchingNextPage, fetchNextPage]);

	const rows = data?.pages.flatMap((p) => p.data) ?? [];
	const stillLoading = !isError && (isPending || hasNextPage === true);

	return {
		rows,
		data: isError || stillLoading ? undefined : rows,
		isPending: stillLoading,
		isError,
		error,
		refetch,
	};
};
