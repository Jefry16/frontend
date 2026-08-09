import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

// The mutating actions on a single invitation: resend (fresh token + renewed
// expiry, re-sends the email) and revoke (cancels a pending invite). Both
// invalidate the invitation detail AND the operator's invitations list so the
// status/expiry refresh everywhere. Both are ADMIN+ on the backend.
export const useInvitationActions = (
	tourOperatorId: string,
	invitationId: string,
) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const base = `/tour-operators/${tourOperatorId}/invitations/${invitationId}`;

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.invitation(tourOperatorId, invitationId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.invitations(tourOperatorId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
	};

	const resend = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.post(`${base}/resend`),
		onSuccess: () => {
			toast.success(m.invitation_resent());
			invalidate();
		},
		onError: () => toast.error(m.error()),
	});

	const revoke = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.delete(base),
		onSuccess: () => {
			toast.success(m.invitation_revoked());
			invalidate();
		},
		onError: () => toast.error(m.error()),
	});

	return { resend, revoke };
};
