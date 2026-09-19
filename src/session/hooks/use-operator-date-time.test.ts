import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { getLocale } = vi.hoisted(() => ({ getLocale: vi.fn(() => "es") }));
vi.mock("#/paraglide/runtime", () => ({ getLocale }));
vi.mock("./use-current-tour-operator", () => ({
	useCurrentTourOperator: () => ({ timezone: "UTC" }),
}));

const { useOperatorDateTime } = await import("./use-operator-date-time");

describe("useOperatorDateTime", () => {
	it("formats in the app's locale, not the runtime default", () => {
		const { result } = renderHook(() => useOperatorDateTime());
		const iso = "2026-08-01T14:30:00Z";

		expect(result.current.formatDate(iso)).toBe(
			new Intl.DateTimeFormat("es", {
				dateStyle: "medium",
				timeZone: "UTC",
			}).format(new Date(iso)),
		);
		expect(result.current.formatDateTime(iso)).toBe(
			new Intl.DateTimeFormat("es", {
				dateStyle: "medium",
				timeStyle: "short",
				timeZone: "UTC",
			}).format(new Date(iso)),
		);
		expect(result.current.formatTimestamp(iso)).toBe(
			new Intl.DateTimeFormat("es", {
				dateStyle: "medium",
				timeStyle: "medium",
				timeZone: "UTC",
			}).format(new Date(iso)),
		);
	});
});
