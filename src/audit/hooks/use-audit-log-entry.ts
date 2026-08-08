import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { AuditLogEntry } from "../types";

// A single audit entry (GET /tour-operators/{id}/audit-log/{entryId}).
// Any member may read it; a missing or cross-tenant id is a 404.
export const useAuditLogEntry = (tourOperatorId: string, entryId: string) =>
	useResource<AuditLogEntry>(
		queryKeys.activityEntry(tourOperatorId, entryId),
		`/tour-operators/${tourOperatorId}/audit-log/${entryId}`,
	);
