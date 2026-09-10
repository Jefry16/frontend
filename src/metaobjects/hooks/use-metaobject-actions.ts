import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

// The mutating actions on one entry (all ADMIN+): publish/unpublish through the
// one `published` sub-resource, and delete (values cascade; success copy +
// navigation left to the caller). Everything refreshes detail + list + trail.
//
// A redundant flip is a silent no-op, not the 409 this used to claim — the use
// case returns before it writes when the entry is already in that state.
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
