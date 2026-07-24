import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

// The mutating actions on a single media asset: delete (ADMIN+). Success copy +
// navigation are left to the caller's per-call onSuccess (it navigates back to
// the library); this invalidates the list and error-toasts.
export const useMediaActions = (tourOperatorId: string, mediaId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	const remove = useMutation<unknown, AxiosError>({
		mutationFn: () =>
			authApi.delete(`/tour-operators/${tourOperatorId}/media/${mediaId}`),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: queryKeys.media(tourOperatorId),
			}),
		onError: () => toast.error(m.error()),
	});

	return { remove };
};
