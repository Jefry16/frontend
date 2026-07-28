// Navigation menus: the operator's storefront navigation (main-menu, footer,
// …). A menu is a handle (what the theme references) + a title + an item TREE
// (max 3 levels) written wholesale via PUT /items. Managed under
// Content → Menus. Every operator starts with main-menu + footer — ordinary,
// renameable, deletable menus.

/** Backend enum names, verbatim on the wire (requests AND responses). */
export type MenuLinkType =
	| "HOME"
	| "EXPERIENCE_LIST"
	| "EXPERIENCE"
	| "PAGE"
	| "EXTERNAL_URL";

export interface MenuListItem {
	id: string;
	context: "menus";
	handle: string;
	title: string;
	createdAt: string;
}

/** One node of the item tree; children are position-ordered. */
export interface MenuItemNode {
	id: string;
	title: string;
	linkType: MenuLinkType;
	/** The target id for EXPERIENCE/PAGE links; null otherwise. */
	resourceId: string | null;
	/** The verbatim URL for EXTERNAL_URL links; null otherwise. */
	url: string | null;
	/** locale → translated title (only the operator's supported locales). */
	titleTranslations: Record<string, string>;
	children: MenuItemNode[];
}

export interface Menu {
	id: string;
	context: "menus";
	/** The theme-facing identifier — immutable after create. */
	handle: string;
	title: string;
	items: MenuItemNode[];
	createdAt: string;
	updatedAt: string;
}

/** One submitted node of the wholesale items-replace payload. */
export interface MenuItemInput {
	title: string;
	linkType: MenuLinkType;
	resourceId?: string;
	url?: string;
	titleTranslations?: Record<string, string>;
	children?: MenuItemInput[];
}
