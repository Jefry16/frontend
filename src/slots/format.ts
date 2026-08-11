import * as m from "#/paraglide/messages";
import type { AppBadgeProps } from "#/shared/components/AppBadge";
import type { SlotAudiencePrice, SlotStatus } from "./types";

// Anchor: 2024-01-07 is a Sunday — day names come from Intl, not a hand list.
const SUNDAY_ANCHOR = new Date(Date.UTC(2024, 0, 7));

export const formatDayName = (day: number): string => {
	const date = new Date(SUNDAY_ANCHOR);
	date.setUTCDate(SUNDAY_ANCHOR.getUTCDate() + day);
	return new Intl.DateTimeFormat(undefined, {
		weekday: "long",
		timeZone: "UTC",
	}).format(date);
};

/** "2026-08-01T10:00:00" (operator-local wall clock) → a local Date with the SAME wall-clock parts. */
const parseWallClock = (dateTime: string): Date | null => {
	const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(dateTime);
	if (!match) return null;
	const [, y, mo, d, h, mn] = match.map(Number);
	return new Date(y ?? 1970, (mo ?? 1) - 1, d ?? 1, h ?? 0, mn ?? 0);
};

/** Wall-clock datetime → "Aug 1, 2026, 10:00 AM" in the viewer's formats — NO timezone conversion. */
export const formatSlotDateTime = (dateTime: string): string => {
	const date = parseWallClock(dateTime);
	if (!date) return dateTime;
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
};

/** ~"2 h 30 min" from the server-derived minutes. */
export const formatSlotDuration = (minutes: number): string => {
	const h = Math.floor(minutes / 60);
	const mn = minutes % 60;
	if (h === 0) return `${mn} min`;
	if (mn === 0) return `${h} h`;
	return `${h} h ${mn} min`;
};

export const formatBookedCapacity = (rows: SlotAudiencePrice[]): string => {
	const capacity = rows.reduce((sum, r) => sum + r.capacity, 0);
	const booked = rows.reduce((sum, r) => sum + r.bookedCount, 0);
	return `${booked} / ${capacity}`;
};

export const formatSlotStatus = (status: SlotStatus): string => {
	switch (status) {
		case "AVAILABLE":
			return m.status_available();
		case "SOLD_OUT":
			return m.status_sold_out();
		case "CANCELLED":
			return m.status_cancelled();
	}
};

export const slotStatusBadgeVariant = (
	status: SlotStatus,
): AppBadgeProps["variant"] => {
	switch (status) {
		case "AVAILABLE":
			return "default";
		case "SOLD_OUT":
			return "secondary";
		case "CANCELLED":
			return "destructive";
	}
};

export const DAY_OPTIONS = [0, 1, 2, 3, 4, 5, 6].map((d) => ({
	value: String(d),
	label: formatDayName(d),
}));

export const STATUS_OPTIONS = (
	["AVAILABLE", "SOLD_OUT", "CANCELLED"] as const
).map((s) => ({ value: s, label: formatSlotStatus(s) }));
