import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { Member } from "../types";

// A single team member (GET /tour-operators/{id}/members/{userId}). Any member
// may read it; a missing or cross-tenant user is a 404.
export const useMember = (tourOperatorId: string, userId: string) =>
	useQuery({
		queryKey: queryKeys.member(tourOperatorId, userId),
		queryFn: async () => {
			const { data } = await authApi.get<Member>(
				`/tour-operators/${tourOperatorId}/members/${userId}`,
			);
			return data;
		},
	});
