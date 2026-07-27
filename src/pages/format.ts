import * as m from "#/paraglide/messages";
import type { AppBadgeProps } from "#/shared/components/AppBadge";
import type { PageStatus } from "./types";

export const pageStatusLabel = (status: PageStatus): string =>
	status === "PUBLISHED" ? m.published() : m.draft();

export const pageStatusBadgeVariant = (
	status: PageStatus,
): AppBadgeProps["variant"] =>
	status === "PUBLISHED" ? "default" : "secondary";

export const PAGE_STATUS_OPTIONS = (["PUBLISHED", "DRAFT"] as const).map(
	(s) => ({ value: s, label: pageStatusLabel(s) }),
);
