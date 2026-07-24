import * as m from "#/paraglide/messages";

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

/** Badge variant: a published experience stands out; a draft is muted. */
export const statusBadgeVariant = (
	published: boolean,
): "default" | "outline" => (published ? "default" : "outline");
