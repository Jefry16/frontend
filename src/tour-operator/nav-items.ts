import type { LinkProps } from "@tanstack/react-router";
import {
	Building2,
	CalendarDays,
	Compass,
	Database,
	FileText,
	History,
	Images,
	Languages,
	LayoutDashboard,
	ListTree,
	type LucideIcon,
	Mail,
	MapPin,
	Settings,
	Shapes,
	UserRound,
	Users,
	UsersRound,
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
	{
		label: m.availability(),
		icon: CalendarDays,
		link: {
			to: "/tour-operators/$tourOperatorId/availability",
			params: { tourOperatorId },
		},
	},
	{
		label: m.audiences(),
		icon: UsersRound,
		link: {
			to: "/tour-operators/$tourOperatorId/audiences",
			params: { tourOperatorId },
		},
	},
	{
		label: m.pickup_locations(),
		icon: MapPin,
		link: {
			to: "/tour-operators/$tourOperatorId/pickup-locations",
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
	{
		label: m.account(),
		icon: UserRound,
		link: {
			to: "/tour-operators/$tourOperatorId/settings/account",
			params: { tourOperatorId },
		},
	},
];

// The main-nav "Operations" section — the operator's day-to-day running of the
// business (activity now; bookings and orders join when the transaction half
// lands). Rendered as a labeled group in the operator sidebar.
export const operationsNavItems = (tourOperatorId: string): NavLeaf[] => [
	{
		label: m.activity(),
		icon: History,
		link: {
			to: "/tour-operators/$tourOperatorId/activity",
			params: { tourOperatorId },
		},
	},
];

// The main-nav "Content" section — storefront/catalog content the operator
// manages (distinct from Settings): pages, media, metafields, metaobjects.
// Rendered as a labeled group in the operator sidebar, above the Settings leaf.
export const contentNavItems = (tourOperatorId: string): NavLeaf[] => [
	{
		label: m.pages(),
		icon: FileText,
		link: {
			to: "/tour-operators/$tourOperatorId/content/pages",
			params: { tourOperatorId },
		},
	},
	{
		label: m.media(),
		icon: Images,
		link: {
			to: "/tour-operators/$tourOperatorId/content/media",
			params: { tourOperatorId },
		},
	},
	{
		label: m.metafields(),
		icon: Database,
		link: {
			to: "/tour-operators/$tourOperatorId/content/metafields",
			params: { tourOperatorId },
		},
	},
	{
		label: m.metaobjects(),
		icon: Shapes,
		link: {
			to: "/tour-operators/$tourOperatorId/content/metaobjects",
			params: { tourOperatorId },
		},
	},
	{
		label: m.menus(),
		icon: ListTree,
		link: {
			to: "/tour-operators/$tourOperatorId/content/menus",
			params: { tourOperatorId },
		},
	},
];
