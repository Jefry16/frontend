import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { Menu } from "../types";

// A single menu with its full item tree. Any member; cross-tenant → 404.
export const useMenu = (tourOperatorId: string, menuId: string) =>
	useResource<Menu>(
		queryKeys.menu(tourOperatorId, menuId),
		`/tour-operators/${tourOperatorId}/menus/${menuId}`,
	);
