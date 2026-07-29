import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

// The message's mutating actions: the read-state flip (any member,
// idempotent, silent — opening a message auto-marks it read, so no toast
// noise) and delete (ADMIN+; audited backend-side; success copy/navigation
// left to the caller).
export const useContactMessageActions = (
	tourOperatorId: string,
	messageId: string,
) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const base = `/tour-operators/${tourOperatorId}/contact-messages/${messageId}`;

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.contactMessage(tourOperatorId, messageId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.contactMessages(tourOperatorId),
		});
	};

	const setRead = useMutation<unknown, AxiosError, { read: boolean }>({
		mutationFn: ({ read }) =>
			authApi.post(`${base}/${read ? "read" : "unread"}`),
		onSuccess: invalidate,
		onError: () => toast.error(m.error()),
	});

	const remove = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.delete(base),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.contactMessages(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
		onError: () => toast.error(m.error()),
	});

	return { setRead, remove };
};
