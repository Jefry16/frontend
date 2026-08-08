import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { Invitation } from "../types";

// A single invitation (GET /tour-operators/{id}/invitations/{invitationId}).
// Any member may read it; a missing or cross-tenant id is a 404.
export const useInvitation = (tourOperatorId: string, invitationId: string) =>
	useResource<Invitation>(
		queryKeys.invitation(tourOperatorId, invitationId),
		`/tour-operators/${tourOperatorId}/invitations/${invitationId}`,
	);
