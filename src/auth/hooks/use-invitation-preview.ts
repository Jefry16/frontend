import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { InvitationPreview } from "../types";

export const useInvitationPreview = (token: string, enabled = true) =>
	useQuery({
		enabled,
		queryKey: queryKeys.invitationPreview(token),
		queryFn: async () =>
			(await authApi.get<InvitationPreview>(`/invitations/${token}/preview`))
				.data,
		retry: false,
	});
