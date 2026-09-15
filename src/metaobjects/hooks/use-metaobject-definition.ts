import { useResource } from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import type { MetaobjectDefinition } from "../types";

export const useMetaobjectDefinition = (
	tourOperatorId: string,
	definitionId: string,
) =>
	useResource<MetaobjectDefinition>(
		queryKeys.metaobjectDefinition(tourOperatorId, definitionId),
		`/tour-operators/${tourOperatorId}/metaobject-definitions/${definitionId}`,
	);
