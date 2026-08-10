import * as m from "#/paraglide/messages";
import type { AppBadgeProps } from "#/shared/components/AppBadge";

/** Localized publish state. */
export const statusLabel = (published: boolean): string =>
	published ? m.published() : m.draft();

/**
 * Badge variant: a published experience stands out; a draft is muted. Same
 * pair pages and metaobjects use — one Draft badge, one look, whatever the
 * entity is.
 */
export const statusBadgeVariant = (
	published: boolean,
): AppBadgeProps["variant"] => (published ? "default" : "secondary");
