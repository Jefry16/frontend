import type { AppBadgeProps } from "@vointika/ui";
import * as m from "#/paraglide/messages";

export const metaobjectStatusLabel = (published: boolean): string =>
	published ? m.published() : m.draft();

export const metaobjectStatusBadgeVariant = (
	published: boolean,
): AppBadgeProps["variant"] => (published ? "success" : "secondary");
