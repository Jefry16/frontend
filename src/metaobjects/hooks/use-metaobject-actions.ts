import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

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
		mutationFn: () => authApi.put(`${base}/published`, { published: true }),
		onSuccess: () => {
			toast.success(m.metaobject_published());
			invalidate();
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	const unpublish = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.put(`${base}/published`, { published: false }),
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
