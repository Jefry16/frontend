import * as m from "#/paraglide/messages";
import type { MenuLinkType } from "./types";

// The link-type catalogue in editor-select order. Grows with the backend
// (CART, METAOBJECT once their storefront routes exist).
export const MENU_LINK_TYPES: MenuLinkType[] = [
	"HOME",
	"EXPERIENCE_LIST",
	"EXPERIENCE",
	"PAGE",
	"EXTERNAL_URL",
];

const LINK_TYPE_LABELS: Record<MenuLinkType, () => string> = {
	HOME: m.menu_link_home,
	EXPERIENCE_LIST: m.menu_link_experience_list,
	EXPERIENCE: m.menu_link_experience,
	PAGE: m.menu_link_page,
	EXTERNAL_URL: m.menu_link_external_url,
};

export const menuLinkTypeLabel = (type: MenuLinkType): string =>
	LINK_TYPE_LABELS[type]();

/** Whether the type targets an operator resource (needs a picker). */
export const isResourceLink = (type: MenuLinkType): boolean =>
	type === "EXPERIENCE" || type === "PAGE";
