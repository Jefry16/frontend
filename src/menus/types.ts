// The item tree is written wholesale via PUT /items, max 3 levels. Every
// operator starts with main-menu and footer, both ordinary and deletable.

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

/** Children are position-ordered. */
export interface MenuItemNode {
	id: string;
	title: string;
	linkType: MenuLinkType;
	/** The target id for EXPERIENCE/PAGE links; null otherwise. */
	resourceId: string | null;
	/** The verbatim URL for EXTERNAL_URL links; null otherwise. */
	url: string | null;
	/** locale → translated title. */
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

export interface MenuItemInput {
	title: string;
	linkType: MenuLinkType;
	resourceId?: string;
	url?: string;
	titleTranslations?: Record<string, string>;
	children?: MenuItemInput[];
}
