import * as m from "#/paraglide/messages";
import type { AppBadgeProps } from "#/shared/components/AppBadge";

export const metaobjectStatusLabel = (published: boolean): string =>
	published ? m.published() : m.draft();

export const metaobjectStatusBadgeVariant = (
	published: boolean,
): AppBadgeProps["variant"] => (published ? "default" : "secondary");
