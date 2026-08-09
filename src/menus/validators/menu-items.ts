import { z } from "zod";
import * as m from "#/paraglide/messages";
import { MENU_LINK_TYPES } from "../format";

/**
 * One editable node of the item tree. Recursive, so `z.lazy` — the depth cap is
 * enforced by the editor (it stops offering "add child"), not here, because a
 * tree that is too deep cannot be typed into existence.
 *
 * The conditional rules mirror what the backend rejects, and they report on the
 * field that is actually wrong: a resource link needs a target, an external link
 * needs a URL. This used to be a recursive `validate()` that returned one string
 * for the whole tree, so the third item's missing URL raised a banner at the top
 * of the page with nothing to point at.
 */
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
					(node.linkType === "EXPERIENCE" || node.linkType === "PAGE") &&
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

// Typed explicitly: `z.lazy` erases the inferred shape to `unknown`, and the
// form's value type has to survive that.
export const menuItemsSchema: z.ZodType<MenuItemsFormData, MenuItemsFormData> =
	z.object({
		items: z.array(menuItemNodeSchema),
	});
