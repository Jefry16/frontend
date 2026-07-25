import { useInfiniteQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import type { MediaAsset } from "../types";

// Images only — the media picker feeds experience thumbnails/galleries, which
// are photos (the library also holds PDFs). Uses the list endpoint's set-filter
// grammar (filter[field][op]=csv).
const IMAGE_FILTER = "filter[contentType][in]=image/jpeg,image/png,image/webp";

interface Page {
	data: MediaAsset[];
	nextCursor: string | null;
}

// The image library as an infinite query, for the media picker grid. Enabled
// only while the picker is open so a closed picker costs nothing.
export const useMediaLibrary = (tourOperatorId: string, enabled: boolean) =>
	useInfiniteQuery<Page>({
		queryKey: ["media-library", tourOperatorId],
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
