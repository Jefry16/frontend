import type { LinkProps } from "@tanstack/react-router";
import {
	Building2,
	Compass,
	Images,
	Languages,
	LayoutDashboard,
	type LucideIcon,
	Mail,
	Settings,
	Users,
} from "lucide-react";
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

// The main-nav "Catalog" section — the operator's sellable products. Grows per
// feature (availability, audiences, pickup locations, …); Experiences is the
// first. Rendered as a labeled group in the operator sidebar.
export const catalogNavItems = (tourOperatorId: string): NavLeaf[] => [
	{
		label: m.experiences(),
		icon: Compass,
		link: {
			to: "/tour-operators/$tourOperatorId/experiences",
			params: { tourOperatorId },
		},
	},
];

// The Settings leaf. Pinned in the sidebar footer (below the scrolling nav —
// Shopify's placement) rather than listed among the feature nav items. Its
// destination will grow into the settings hub/space; today it's a stub page.
export const settingsNavItem = (tourOperatorId: string): NavLeaf => ({
	label: m.settings(),
	icon: Settings,
	link: {
		to: "/tour-operators/$tourOperatorId/settings",
		params: { tourOperatorId },
	},
});

// The sections listed in the settings rail (the settings "space"). Grows one
// leaf per settings section. Shares NavLeaf with the feature nav so both render
// through SidebarNavLeaf.
export const settingsSectionItems = (tourOperatorId: string): NavLeaf[] => [
	{
		label: m.general(),
		icon: Building2,
		link: {
			to: "/tour-operators/$tourOperatorId/settings/general",
			params: { tourOperatorId },
		},
	},
	{
		label: m.members(),
		icon: Users,
		link: {
			to: "/tour-operators/$tourOperatorId/settings/members",
			params: { tourOperatorId },
		},
	},
	{
		label: m.invitations(),
		icon: Mail,
		link: {
			to: "/tour-operators/$tourOperatorId/settings/invitations",
			params: { tourOperatorId },
		},
	},
	{
		label: m.languages(),
		icon: Languages,
		link: {
			to: "/tour-operators/$tourOperatorId/settings/languages",
			params: { tourOperatorId },
		},
	},
];

// The main-nav "Content" section — storefront/catalog content the operator
// manages (distinct from Settings). Grows per feature; Media is the first.
// Rendered as a labeled group in the operator sidebar, above the Settings leaf.
export const contentNavItems = (tourOperatorId: string): NavLeaf[] => [
	{
		label: m.media(),
		icon: Images,
		link: {
			to: "/tour-operators/$tourOperatorId/content/media",
			params: { tourOperatorId },
		},
	},
];
