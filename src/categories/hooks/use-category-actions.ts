import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

export const useCategoryActions = (
	tourOperatorId: string,
	categoryId: string,
) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	const remove = useMutation<unknown, AxiosError>({
		mutationFn: () =>
			authApi.delete(
				`/tour-operators/${tourOperatorId}/categories/${categoryId}`,
			),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.categories(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
		onError: () => toast.error(m.error()),
	});

	return { remove };
};
