import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { Menu } from "../types";

// A single menu with its full item tree. Any member; cross-tenant → 404.
export const useMenu = (tourOperatorId: string, menuId: string) =>
	useQuery({
		queryKey: queryKeys.menu(tourOperatorId, menuId),
		queryFn: async () => {
			const { data } = await authApi.get<Menu>(
				`/tour-operators/${tourOperatorId}/menus/${menuId}`,
			);
			return data;
		},
	});
