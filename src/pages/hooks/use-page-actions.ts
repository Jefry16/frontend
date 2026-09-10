import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

// The mutating actions on a single page (all ADMIN+): publish/unpublish through
// the one `published` sub-resource (PUT the boolean; asking for the state it is
// already in is a silent no-op),
// rename the handle (409 = taken), delete. Success copy + navigation for
// delete are left to the caller; everything refreshes detail + list + trail.
export const usePageActions = (tourOperatorId: string, pageId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const base = `/tour-operators/${tourOperatorId}/pages/${pageId}`;

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.pageDetail(tourOperatorId, pageId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.pages(tourOperatorId),
		});
		// Every action appends an audit entry — refresh the trail.
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
	};

	const publish = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.put(`${base}/published`, { published: true }),
		onSuccess: () => {
			toast.success(m.page_published());
			invalidate();
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	const unpublish = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.put(`${base}/published`, { published: false }),
		onSuccess: () => {
			toast.success(m.page_unpublished());
			invalidate();
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	const rename = useMutation<unknown, AxiosError, string>({
		mutationFn: (handle) => authApi.post(`${base}/rename`, { handle }),
		onSuccess: () => {
			toast.success(m.handle_renamed());
			invalidate();
		},
	});

	const remove = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.delete(base),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.pages(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
		onError: () => toast.error(m.error()),
	});

	return { publish, unpublish, rename, remove };
};
