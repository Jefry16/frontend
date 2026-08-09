import { describe, expect, it } from "vitest";
import { type MenuItemFormNode, menuItemsSchema } from "./menu-items";

const node = (over: Partial<MenuItemFormNode> = {}): MenuItemFormNode => ({
	title: "Home",
	linkType: "HOME",
	resourceId: "",
	url: "",
	translations: {},
	children: [],
	...over,
});

const paths = (value: { items: MenuItemFormNode[] }) =>
	menuItemsSchema.safeParse(value).error?.issues.map((i) => i.path.join("."));

describe("menuItemsSchema", () => {
	// This was a recursive validate() returning one string for the whole tree, so
	// a nested item's missing URL raised a banner at the top of the page with
	// nothing to point at. Now it reports on the field.
	it("reports a missing URL on the nested item that lacks it", () => {
		const result = paths({
			items: [
				node(),
				node({
					title: "Guides",
					children: [node({ title: "Blog", linkType: "EXTERNAL_URL" })],
				}),
			],
		});

		expect(result).toContain("items.1.children.0.url");
		expect(result).not.toContain("items.0.url");
	});

	it("requires a target on a resource link", () => {
		expect(paths({ items: [node({ linkType: "PAGE" })] })).toContain(
			"items.0.resourceId",
		);
	});

	it("requires a title at any depth", () => {
		expect(
			paths({ items: [node({ children: [node({ title: "  " })] })] }),
		).toContain("items.0.children.0.title");
	});

	it("accepts a link kind that needs neither target nor URL", () => {
		expect(menuItemsSchema.safeParse({ items: [node()] }).success).toBe(true);
	});

	it("accepts a filled external link and a filled resource link", () => {
		expect(
			menuItemsSchema.safeParse({
				items: [
					node({ linkType: "EXTERNAL_URL", url: "https://example.com" }),
					node({ linkType: "PAGE", resourceId: "page-1" }),
				],
			}).success,
		).toBe(true);
	});
});
