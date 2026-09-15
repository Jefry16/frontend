import { useResource } from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import type { AuditLogEntry } from "../types";

export const useAuditLogEntry = (tourOperatorId: string, entryId: string) =>
	useResource<AuditLogEntry>(
		queryKeys.activityEntry(tourOperatorId, entryId),
		`/tour-operators/${tourOperatorId}/audit-log/${entryId}`,
	);
