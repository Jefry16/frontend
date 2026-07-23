import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { Invitation } from "../types";

// A single invitation (GET /tour-operators/{id}/invitations/{invitationId}).
// Any member may read it; a missing or cross-tenant id is a 404.
export const useInvitation = (tourOperatorId: string, invitationId: string) =>
	useQuery({
		queryKey: queryKeys.invitation(tourOperatorId, invitationId),
		queryFn: async () => {
			const { data } = await authApi.get<Invitation>(
				`/tour-operators/${tourOperatorId}/invitations/${invitationId}`,
			);
			return data;
		},
	});
