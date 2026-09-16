import { z } from "zod";
import * as m from "#/paraglide/messages";
import { MENU_LINK_TYPES } from "../format";

export interface MenuItemFormNode {
	title: string;
	linkType: (typeof MENU_LINK_TYPES)[number];
	resourceId: string;
	url: string;
	translations: Record<string, string>;
	children: MenuItemFormNode[];
}

const menuItemNodeSchema: z.ZodType<MenuItemFormNode, MenuItemFormNode> =
	z.lazy(() =>
		z
			.object({
				title: z.string().trim().min(1, m.menu_items_title_required()),
				linkType: z.enum(MENU_LINK_TYPES as [string, ...string[]]),
				resourceId: z.string(),
				url: z.string().trim(),
				translations: z.record(z.string(), z.string()),
				children: z.array(menuItemNodeSchema),
			})
			.superRefine((node, ctx) => {
				if (
					(node.linkType === "EXPERIENCE" ||
						node.linkType === "PAGE" ||
						node.linkType === "CATEGORY") &&
					!node.resourceId
				) {
					ctx.addIssue({
						code: "custom",
						path: ["resourceId"],
						message: m.menu_items_target_required(),
					});
				}
				if (node.linkType === "EXTERNAL_URL" && !node.url.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["url"],
						message: m.menu_items_url_required(),
					});
				}
			}),
	) as z.ZodType<MenuItemFormNode, MenuItemFormNode>;

interface MenuItemsFormData {
	items: MenuItemFormNode[];
}

export const menuItemsSchema: z.ZodType<MenuItemsFormData, MenuItemsFormData> =
	z.object({
		items: z.array(menuItemNodeSchema),
	});
