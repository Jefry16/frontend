import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { Page } from "../types";

// A single page, body included. Any member; cross-tenant id → 404.
export const usePage = (tourOperatorId: string, pageId: string) =>
	useQuery({
		queryKey: queryKeys.pageDetail(tourOperatorId, pageId),
		queryFn: async () => {
			const { data } = await authApi.get<Page>(
				`/tour-operators/${tourOperatorId}/pages/${pageId}`,
			);
			return data;
		},
	});
