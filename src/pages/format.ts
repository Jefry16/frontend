import * as m from "#/paraglide/messages";
import type { AppBadgeProps } from "#/shared/components/AppBadge";

export const pageStatusLabel = (published: boolean): string =>
	published ? m.published() : m.draft();

export const pageStatusBadgeVariant = (
	published: boolean,
): AppBadgeProps["variant"] => (published ? "default" : "secondary");
