import * as m from "#/paraglide/messages";
import type { AppBadgeProps } from "#/shared/components/AppBadge";

/** Human duration from minutes: "45m", "2h", "2h 30m". */
export const formatDuration = (minutes: number): string => {
	const h = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (h === 0) return `${mins}m`;
	if (mins === 0) return `${h}h`;
	return `${h}h ${mins}m`;
};

/** Localized publish state. */
export const statusLabel = (published: boolean): string =>
	published ? m.published() : m.draft();

/**
 * Badge variant: a published experience stands out; a draft is muted. Same
 * pair pages and metaobjects use — one Draft badge, one look, whatever the
 * entity is. (This returned `outline` until 2026-08-08, which drew the same
 * m.draft() label as an outlined chip here and a filled one everywhere else.)
 */
export const statusBadgeVariant = (
	published: boolean,
): AppBadgeProps["variant"] => (published ? "default" : "secondary");
