import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { MenuItemInput } from "../types";

// The menu's mutating actions (all ADMIN+): rename (title only — the handle
// is immutable), delete (items cascade; success copy/navigation left to the
// caller), and the wholesale item-tree replace (the editor's save).
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
