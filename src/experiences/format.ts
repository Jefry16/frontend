import type { AppBadgeProps } from "@vointika/ui";
import * as m from "#/paraglide/messages";

export const statusLabel = (published: boolean): string =>
	published ? m.published() : m.draft();

export const statusBadgeVariant = (
	published: boolean,
): AppBadgeProps["variant"] => (published ? "success" : "secondary");
