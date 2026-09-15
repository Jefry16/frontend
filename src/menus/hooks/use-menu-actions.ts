import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { MenuItemInput } from "../types";

export const useMenuActions = (tourOperatorId: string, menuId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const base = `/tour-operators/${tourOperatorId}/menus/${menuId}`;

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.menu(tourOperatorId, menuId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.menus(tourOperatorId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
	};

	const rename = useMutation<unknown, AxiosError, { title: string }>({
		mutationFn: ({ title }) => authApi.patch(base, { title }),
		onSuccess: () => {
			toast.updated(m.menu());
			invalidate();
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	const remove = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.delete(base),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.menus(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
		onError: () => toast.error(m.error()),
	});

	const replaceItems = useMutation<unknown, AxiosError, MenuItemInput[]>({
		mutationFn: (items) => authApi.put(`${base}/items`, { items }),
		onSuccess: () => {
			toast.success(m.menu_items_saved());
			invalidate();
		},
	});

	return { rename, remove, replaceItems };
};
