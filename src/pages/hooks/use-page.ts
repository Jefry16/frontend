import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { Page } from "../types";

// A single page, body included. Any member; cross-tenant id → 404.
export const usePage = (tourOperatorId: string, pageId: string) =>
	useResource<Page>(
		queryKeys.pageDetail(tourOperatorId, pageId),
		`/tour-operators/${tourOperatorId}/pages/${pageId}`,
	);
