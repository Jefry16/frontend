import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { apiErrorMessage } from "#/lib/api-error";
import { isResourceLink } from "../format";
import type { Menu, MenuItemInput, MenuItemNode } from "../types";
import {
	type MenuItemFormNode,
	menuItemsSchema,
} from "../validators/menu-items";
import { useMenuActions } from "./use-menu-actions";

/** A fresh row. Exported so the editor's "add" buttons agree on the shape. */
export const emptyMenuItem = (): MenuItemFormNode => ({
	title: "",
	linkType: "HOME",
	resourceId: "",
	url: "",
	translations: {},
	children: [],
});

const toFormNodes = (nodes: MenuItemNode[]): MenuItemFormNode[] =>
	nodes.map((node) => ({
		title: node.title,
		linkType: node.linkType,
		resourceId: node.resourceId ?? "",
		url: node.url ?? "",
		translations: { ...node.titleTranslations },
		children: toFormNodes(node.children),
	}));

// The wire shape: drop the fields the chosen link kind doesn't use, and the
// blank translations, so the payload carries only what it means.
const toPayload = (nodes: MenuItemFormNode[]): MenuItemInput[] =>
	nodes.map((node) => {
		const translations = Object.fromEntries(
			Object.entries(node.translations).filter(([, value]) => value.trim()),
		);
		return {
			title: node.title.trim(),
			linkType: node.linkType,
			...(isResourceLink(node.linkType) && { resourceId: node.resourceId }),
			...(node.linkType === "EXTERNAL_URL" && { url: node.url.trim() }),
			...(Object.keys(translations).length > 0 && {
				titleTranslations: translations,
			}),
			...(node.children.length > 0 && { children: toPayload(node.children) }),
		};
	});

/**
 * The item tree as one form. The whole tree saves WHOLESALE via `PUT /items` —
 * the backend's write model has no per-item call — so the form holds the tree
 * and the submit maps it to the payload.
 */
export const useMenuItemsForm = (tourOperatorId: string, menu: Menu) => {
	const navigate = useNavigate();
	const { replaceItems } = useMenuActions(tourOperatorId, menu.id);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { items: toFormNodes(menu.items) },
		validators: { onSubmit: menuItemsSchema },
		onSubmit: ({ value }) => {
			setErrorMessage(null);
			replaceItems.mutate(toPayload(value.items), {
				onSuccess: () =>
					navigate({
						to: "/tour-operators/$tourOperatorId/content/menus/$menuId",
						params: { tourOperatorId, menuId: menu.id },
					}),
				onError: (error) => setErrorMessage(apiErrorMessage(error)),
			});
		},
	});

	return { form, isPending: replaceItems.isPending, errorMessage };
};
