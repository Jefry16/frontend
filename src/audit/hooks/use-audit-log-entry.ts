import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { AuditLogEntry } from "../types";

// A single audit entry (GET /tour-operators/{id}/audit-log/{entryId}).
// Any member may read it; a missing or cross-tenant id is a 404.
export const useAuditLogEntry = (tourOperatorId: string, entryId: string) =>
	useQuery({
		queryKey: queryKeys.activityEntry(tourOperatorId, entryId),
		queryFn: async () => {
			const { data } = await authApi.get<AuditLogEntry>(
				`/tour-operators/${tourOperatorId}/audit-log/${entryId}`,
			);
			return data;
		},
	});
