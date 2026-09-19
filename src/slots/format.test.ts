import { describe, expect, it, vi } from "vitest";

const { getLocale } = vi.hoisted(() => ({ getLocale: vi.fn(() => "es") }));
vi.mock("#/paraglide/runtime", async (importOriginal) => {
	const actual = await importOriginal<typeof import("#/paraglide/runtime")>();
	return { ...actual, getLocale };
});

const { formatDayName, formatSlotDateTime } = await import("./format");

describe("formatDayName", () => {
	it("names the day in the app's locale, not the runtime default", () => {
		expect(formatDayName(0)).toBe(
			new Intl.DateTimeFormat("es", {
				weekday: "long",
				timeZone: "UTC",
			}).format(new Date(Date.UTC(2024, 0, 7))),
		);
	});
});

describe("formatSlotDateTime", () => {
	it("formats the date and time in the app's locale, not the runtime default", () => {
		expect(formatSlotDateTime("2026-08-01T14:30:00")).toBe(
			new Intl.DateTimeFormat("es", {
				dateStyle: "medium",
				timeStyle: "short",
			}).format(new Date(2026, 7, 1, 14, 30)),
		);
	});
});
