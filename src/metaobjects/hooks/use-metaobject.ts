import { useResource } from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import type { Metaobject } from "../types";

export const useMetaobject = (tourOperatorId: string, metaobjectId: string) =>
	useResource<Metaobject>(
		queryKeys.metaobject(tourOperatorId, metaobjectId),
		`/tour-operators/${tourOperatorId}/metaobjects/${metaobjectId}`,
	);
