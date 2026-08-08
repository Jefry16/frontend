import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { Member } from "../types";

// A single team member (GET /tour-operators/{id}/members/{userId}). Any member
// may read it; a missing or cross-tenant user is a 404.
export const useMember = (tourOperatorId: string, userId: string) =>
	useResource<Member>(
		queryKeys.member(tourOperatorId, userId),
		`/tour-operators/${tourOperatorId}/members/${userId}`,
	);
