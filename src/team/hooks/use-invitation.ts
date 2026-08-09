import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { Invitation } from "../types";

// A single invitation (GET /tour-operators/{id}/invitations/{invitationId}).
export const useInvitation = (tourOperatorId: string, invitationId: string) =>
	useResource<Invitation>(
		queryKeys.invitation(tourOperatorId, invitationId),
		`/tour-operators/${tourOperatorId}/invitations/${invitationId}`,
	);
