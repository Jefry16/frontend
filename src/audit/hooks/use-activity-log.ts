import { useInfiniteQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { AuditLogEntry } from "../types";

interface ActivityPage {
	data: AuditLogEntry[];
	nextCursor: string | null;
}

// One entity's audit timeline, newest first (the server's -id default), with
// load-more pagination.
export const useActivityLog = (
	tourOperatorId: string,
	entityType: string,
	entityId: string,
) =>
	useInfiniteQuery({
		queryKey: queryKeys.activityTimeline(tourOperatorId, entityType, entityId),
		queryFn: async ({ pageParam }) => {
			const params = new URLSearchParams();
			params.set("filter[entityType][eq]", entityType);
			params.set("filter[entityId][eq]", entityId);
			if (pageParam) params.set("cursor", pageParam);
			const { data } = await authApi.get<ActivityPage>(
				`/tour-operators/${tourOperatorId}/audit-log?${params}`,
			);
			return data;
		},
		initialPageParam: null as string | null,
		getNextPageParam: (last) => last.nextCursor,
	});
