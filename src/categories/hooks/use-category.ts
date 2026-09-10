import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { Category } from "../types";

// A single category (GET /tour-operators/{id}/categories/{categoryId}). Any
// member may read it; a missing or cross-tenant id is a 404.
export const useCategory = (tourOperatorId: string, categoryId: string) =>
	useResource<Category>(
		queryKeys.category(tourOperatorId, categoryId),
		`/tour-operators/${tourOperatorId}/categories/${categoryId}`,
	);
