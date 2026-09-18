import type { AppBadgeProps } from "@vointika/ui";
import * as m from "#/paraglide/messages";

export const pageStatusLabel = (published: boolean): string =>
	published ? m.published() : m.draft();

export const pageStatusBadgeVariant = (
	published: boolean,
): AppBadgeProps["variant"] => (published ? "success" : "secondary");
