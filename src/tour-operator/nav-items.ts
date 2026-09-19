import type { LinkProps } from "@tanstack/react-router";
import {
	Building2,
	CalendarDays,
	Compass,
	Database,
	FileText,
	Globe,
	History,
	Images,
	Inbox,
	Languages,
	LayoutDashboard,
	ListTree,
	type LucideIcon,
	Mail,
	MapPin,
	Scale,
	Settings,
	Shapes,
	Tags,
	Target,
	UserRound,
	UsersRound,
} from "lucide-react";
import * as m from "#/paraglide/messages";

export interface NavLeaf {
	label: string;
	icon: LucideIcon;
	link: Pick<LinkProps, "to" | "params">;
	exact?: boolean;
}

export const tourOperatorNavItems = (tourOperatorId: string): NavLeaf[] => [
	{
		label: m.dashboard(),
		icon: LayoutDashboard,
		link: { to: "/tour-operators/$tourOperatorId", params: { tourOperatorId } },
		exact: true,
	},
];

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
		label: m.categories(),
		icon: Tags,
		link: {
			to: "/tour-operators/$tourOperatorId/categories",
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
		icon: Target,
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

export const settingsNavItem = (tourOperatorId: string): NavLeaf => ({
	label: m.settings(),
	icon: Settings,
	link: {
		to: "/tour-operators/$tourOperatorId/settings",
		params: { tourOperatorId },
	},
});

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
		icon: UsersRound,
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
		label: m.translations(),
		icon: Globe,
		link: {
			to: "/tour-operators/$tourOperatorId/settings/translations",
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

export const operationsNavItems = (tourOperatorId: string): NavLeaf[] => [
	{
		label: m.inbox(),
		icon: Inbox,
		link: {
			to: "/tour-operators/$tourOperatorId/inbox",
			params: { tourOperatorId },
		},
	},
	{
		label: m.activity(),
		icon: History,
		link: {
			to: "/tour-operators/$tourOperatorId/activity",
			params: { tourOperatorId },
		},
	},
];

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
		label: m.policies(),
		icon: Scale,
		link: {
			to: "/tour-operators/$tourOperatorId/content/policies",
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
