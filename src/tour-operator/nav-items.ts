import type { LinkProps } from "@tanstack/react-router";
import { LayoutDashboard, type LucideIcon } from "lucide-react";
import * as m from "#/paraglide/messages";

export interface NavLeaf {
	label: string;
	icon: LucideIcon;
	link: Pick<LinkProps, "to" | "params">;
	/** Match the route exactly (Dashboard) vs. prefix-match (section roots). */
	exact?: boolean;
}

// The operator sidebar's nav. Grows one leaf per feature slice (bookings,
// experiences, orders, …); only Dashboard exists today. New feature routes add
// their entry here, matching the query-keys grow-per-feature convention.
export const tourOperatorNavItems = (tourOperatorId: string): NavLeaf[] => [
	{
		label: m.dashboard(),
		icon: LayoutDashboard,
		link: { to: "/tour-operators/$tourOperatorId", params: { tourOperatorId } },
		exact: true,
	},
];
