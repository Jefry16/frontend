import { useInfiniteQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { MediaAsset } from "../types";

const IMAGE_FILTER = "filter[contentType][in]=image/jpeg,image/png,image/webp";

interface Page {
	data: MediaAsset[];
	nextCursor: string | null;
}

export const useMediaLibrary = (tourOperatorId: string, enabled: boolean) =>
	useInfiniteQuery<Page>({
		queryKey: queryKeys.mediaLibrary(tourOperatorId),
		enabled,
		queryFn: async ({ pageParam }) => {
			const base = `/tour-operators/${tourOperatorId}/media`;
			const cursor = pageParam
				? `&cursor=${encodeURIComponent(pageParam as string)}`
				: "";
			const { data } = await authApi.get<Page>(
				`${base}?${IMAGE_FILTER}${cursor}`,
			);
			return data;
		},
		initialPageParam: null as string | null,
		getNextPageParam: (last) => last.nextCursor,
	});
