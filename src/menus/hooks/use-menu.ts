import { useResource } from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import type { Menu } from "../types";

export const useMenu = (tourOperatorId: string, menuId: string) =>
	useResource<Menu>(
		queryKeys.menu(tourOperatorId, menuId),
		`/tour-operators/${tourOperatorId}/menus/${menuId}`,
	);
