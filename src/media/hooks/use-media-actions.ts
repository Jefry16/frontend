import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

// The mutating actions on a single media asset: describe (set the alt text) and
// delete, both ADMIN+. Success copy + navigation are left to the caller's
// per-call onSuccess; this invalidates and error-toasts.
export const useMediaActions = (tourOperatorId: string, mediaId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	const base = `/tour-operators/${tourOperatorId}/media/${mediaId}`;

	// Alt is the one part of a row written after the upload — width and height are
	// measured from the bytes, but only the uploader knows what the image shows.
	// A blank string clears it, which is why the payload is not optional.
	const describe = useMutation<unknown, AxiosError, string>({
		mutationFn: (alt) => authApi.patch(base, { alt }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.mediaAsset(tourOperatorId, mediaId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.media(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
		onError: () => toast.error(m.error()),
	});

	const remove = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.delete(base),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.media(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
		onError: () => toast.error(m.error()),
	});

	return { describe, remove };
};
