import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

// The mutating actions on one entry (all ADMIN+): publish/unpublish (409 on
// a redundant flip) and delete (values cascade; success copy + navigation
// left to the caller). Everything refreshes detail + list + trail.
export const useMetaobjectActions = (
	tourOperatorId: string,
	metaobjectId: string,
) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const base = `/tour-operators/${tourOperatorId}/metaobjects/${metaobjectId}`;

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.metaobject(tourOperatorId, metaobjectId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.metaobjects(tourOperatorId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
	};

	const publish = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.post(`${base}/publish`),
		onSuccess: () => {
			toast.success(m.metaobject_published());
			invalidate();
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	const unpublish = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.post(`${base}/unpublish`),
		onSuccess: () => {
			toast.success(m.metaobject_unpublished());
			invalidate();
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	const remove = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.delete(base),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.metaobjects(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
		onError: () => toast.error(m.error()),
	});

	return { publish, unpublish, remove };
};
