import * as m from "#/paraglide/messages";
import type { AppBadgeProps } from "#/shared/components/AppBadge";

export const statusLabel = (published: boolean): string =>
	published ? m.published() : m.draft();

export const statusBadgeVariant = (
	published: boolean,
): AppBadgeProps["variant"] => (published ? "default" : "secondary");
