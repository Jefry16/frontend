import { describe, expect, it } from "vitest";
import { composeStartEnd, rollsToNextDay } from "./slot";

// The only hand-rolled date arithmetic in the app. There is no date library
// behind it, and an off-by-one-day is invisible until someone reads a booking.

describe("rollsToNextDay", () => {
	// Equal is not "zero length" — a departure whose end time matches its start
	// runs a full 24 hours, which is the maximum a slot may span.
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

describe("composeStartEnd", () => {
	const compose = (date: string, startTime: string, endTime: string) =>
		composeStartEnd({ date, startTime, endTime } as never);

	it("keeps both endpoints on the same day for an ordinary departure", () => {
		expect(compose("2026-06-01", "10:00", "11:30")).toEqual({
			startAt: "2026-06-01T10:00:00",
			endAt: "2026-06-01T11:30:00",
		});
	});

	it("moves the END date, not the start, when the departure crosses midnight", () => {
		expect(compose("2026-06-01", "22:00", "02:00")).toEqual({
			startAt: "2026-06-01T22:00:00",
			endAt: "2026-06-02T02:00:00",
		});
	});

	// The next day is computed through Date rather than by incrementing the day
	// number, which is the whole reason these hold.
	it.each([
		["2026-12-31", "2027-01-01", "year end"],
		["2026-02-28", "2026-03-01", "non-leap February"],
		["2028-02-28", "2028-02-29", "leap February"],
		["2026-04-30", "2026-05-01", "30-day month end"],
	])("rolls %s → %s (%s)", (date, expectedDate) => {
		expect(compose(date, "22:00", "02:00").endAt).toBe(
			`${expectedDate}T02:00:00`,
		);
	});

	// Every duration the domain allows, against every start minute. This is the
	// property the whole thing rests on, and it is exact up to 1440 — which is
	// also the longest span a Slot may have. See the DurationMinutes /
	// Slot.MAX_SPAN entry in MAP.md: an experience may be declared longer than
	// this, and the composition silently truncates when it is.
	it("spans exactly the requested duration for every minute up to 24h", () => {
		const wrong: string[] = [];
		for (let duration = 1; duration <= 1440; duration++) {
			for (let startMinute = 0; startMinute < 1440; startMinute += 13) {
				const startTime = `${String(Math.floor(startMinute / 60)).padStart(2, "0")}:${String(startMinute % 60).padStart(2, "0")}`;
				const endMinute = (startMinute + duration) % 1440;
				const endTime = `${String(Math.floor(endMinute / 60)).padStart(2, "0")}:${String(endMinute % 60).padStart(2, "0")}`;
				const { startAt, endAt } = compose("2026-06-01", startTime, endTime);
				const span =
					(Date.parse(`${endAt}Z`) - Date.parse(`${startAt}Z`)) / 60000;
				if (span !== duration) wrong.push(`${startTime}+${duration}=${span}`);
			}
		}
		expect(wrong).toEqual([]);
	});
});
