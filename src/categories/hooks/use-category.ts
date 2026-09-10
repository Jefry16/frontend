import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { Category } from "../types";

export const useCategory = (tourOperatorId: string, categoryId: string) =>
	useResource<Category>(
		queryKeys.category(tourOperatorId, categoryId),
		`/tour-operators/${tourOperatorId}/categories/${categoryId}`,
	);
