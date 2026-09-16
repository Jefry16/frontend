import { describe, expect, it } from "vitest";
import { expandDepartures, rollsToNextDay } from "./slot";

describe("rollsToNextDay", () => {
	it.each([
		["22:00", "02:00", true],
		["10:00", "10:00", true],
		["10:00", "09:59", true],
		["10:00", "10:01", false],
		["00:00", "23:59", false],
	])("%s → %s rolls: %s", (start, end, expected) => {
		expect(rollsToNextDay(start, end)).toBe(expected);
	});

	it("is false when either time is malformed", () => {
		expect(rollsToNextDay("", "10:00")).toBe(false);
		expect(rollsToNextDay("10:00", "9:00")).toBe(false);
	});
});

describe("expandDepartures", () => {
	const ALL = [0, 1, 2, 3, 4, 5, 6];
	const expand = (
		days: number[],
		validFrom: string,
		validTo: string,
		startTime = "10:00",
		endTime = "11:30",
	) => expandDepartures({ days, validFrom, validTo, startTime, endTime });
	const one = (date: string, startTime: string, endTime: string) =>
		expand(ALL, date, date, startTime, endTime)[0];

	it("makes one departure per date whose weekday is selected", () => {
		// 2026-06-01 is a Monday
		expect(
			expand([1, 3, 5], "2026-06-01", "2026-06-07").map((d) => d.startAt),
		).toEqual([
			"2026-06-01T10:00:00",
			"2026-06-03T10:00:00",
			"2026-06-05T10:00:00",
		]);
	});

	it("includes the last date of the window", () => {
		expect(
			expand(ALL, "2026-06-01", "2026-06-03").map((d) => d.startAt),
		).toEqual([
			"2026-06-01T10:00:00",
			"2026-06-02T10:00:00",
			"2026-06-03T10:00:00",
		]);
	});

	it("keeps both endpoints on the same day for an ordinary departure", () => {
		expect(one("2026-06-01", "10:00", "11:30")).toEqual({
			startAt: "2026-06-01T10:00:00",
			endAt: "2026-06-01T11:30:00",
		});
	});

	it("moves the END date, not the start, when the departure crosses midnight", () => {
		expect(one("2026-06-01", "22:00", "02:00")).toEqual({
			startAt: "2026-06-01T22:00:00",
			endAt: "2026-06-02T02:00:00",
		});
	});

	it.each([
		["2026-12-31", "2027-01-01", "year end"],
		["2026-02-28", "2026-03-01", "non-leap February"],
		["2028-02-28", "2028-02-29", "leap February"],
		["2026-04-30", "2026-05-01", "30-day month end"],
	])("rolls %s → %s (%s)", (date, expectedDate) => {
		expect(one(date, "22:00", "02:00")?.endAt).toBe(`${expectedDate}T02:00:00`);
	});

	it("spans exactly the requested duration for every minute up to 24h", () => {
		const wrong: string[] = [];
		for (let duration = 1; duration <= 1440; duration++) {
			for (let startMinute = 0; startMinute < 1440; startMinute += 13) {
				const startTime = `${String(Math.floor(startMinute / 60)).padStart(2, "0")}:${String(startMinute % 60).padStart(2, "0")}`;
				const endMinute = (startMinute + duration) % 1440;
				const endTime = `${String(Math.floor(endMinute / 60)).padStart(2, "0")}:${String(endMinute % 60).padStart(2, "0")}`;
				const { startAt, endAt } = one("2026-06-01", startTime, endTime) ?? {
					startAt: "",
					endAt: "",
				};
				const span =
					(Date.parse(`${endAt}Z`) - Date.parse(`${startAt}Z`)) / 60000;
				if (span !== duration) wrong.push(`${startTime}+${duration}=${span}`);
			}
		}
		expect(wrong).toEqual([]);
	});
});
