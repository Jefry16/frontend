import { useResource } from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import type { Page } from "../types";

export const usePage = (tourOperatorId: string, pageId: string) =>
	useResource<Page>(
		queryKeys.pageDetail(tourOperatorId, pageId),
		`/tour-operators/${tourOperatorId}/pages/${pageId}`,
	);
