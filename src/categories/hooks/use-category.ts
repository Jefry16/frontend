import { useResource } from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import type { Category } from "../types";

export const useCategory = (tourOperatorId: string, categoryId: string) =>
	useResource<Category>(
		queryKeys.category(tourOperatorId, categoryId),
		`/tour-operators/${tourOperatorId}/categories/${categoryId}`,
	);
