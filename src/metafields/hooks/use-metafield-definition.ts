import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { MetafieldDefinition } from "../types";

export const useMetafieldDefinition = (
	tourOperatorId: string,
	definitionId: string,
) =>
	useResource<MetafieldDefinition>(
		queryKeys.metafieldDefinition(tourOperatorId, definitionId),
		`/tour-operators/${tourOperatorId}/metafield-definitions/${definitionId}`,
	);
