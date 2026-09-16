export type MenuLinkType =
	| "HOME"
	| "EXPERIENCE_LIST"
	| "EXPERIENCE"
	| "PAGE"
	| "CATEGORY"
	| "EXTERNAL_URL";

export interface MenuListItem {
	id: string;
	context: "menus";
	handle: string;
	title: string;
	createdAt: string;
}

export interface MenuItemNode {
	id: string;
	title: string;
	linkType: MenuLinkType;
	resourceId: string | null;
	url: string | null;
	titleTranslations: Record<string, string>;
	children: MenuItemNode[];
}

export interface Menu {
	id: string;
	context: "menus";
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
