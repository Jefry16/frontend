import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

export const useMediaActions = (tourOperatorId: string, mediaId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	const base = `/tour-operators/${tourOperatorId}/media/${mediaId}`;

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
