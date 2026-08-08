import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { MetafieldDefinition } from "../types";

// A single definition. Any member; cross-tenant id → 404.
export const useMetafieldDefinition = (
	tourOperatorId: string,
	definitionId: string,
) =>
	useResource<MetafieldDefinition>(
		queryKeys.metafieldDefinition(tourOperatorId, definitionId),
		`/tour-operators/${tourOperatorId}/metafield-definitions/${definitionId}`,
	);
