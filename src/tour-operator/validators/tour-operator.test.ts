import { describe, expect, it } from "vitest";
import { tourOperatorSchema } from "./tour-operator";

const valid = {
	name: "Acme Tours",
	address: "1 Main St",
	timezoneId: "tz-1",
	currencyId: "cur-1",
};

describe("tourOperatorSchema", () => {
	it("accepts a valid operator", () => {
		expect(tourOperatorSchema.safeParse(valid).success).toBe(true);
	});

	it("trims the name and requires >= 2 chars", () => {
		expect(
			tourOperatorSchema.safeParse({ ...valid, name: " A " }).success,
		).toBe(false);
		expect(tourOperatorSchema.parse({ ...valid, name: "  Acme  " }).name).toBe(
			"Acme",
		);
	});

	it("requires a timezone and currency", () => {
		expect(
			tourOperatorSchema.safeParse({ ...valid, timezoneId: "" }).success,
		).toBe(false);
		expect(
			tourOperatorSchema.safeParse({ ...valid, currencyId: "" }).success,
		).toBe(false);
	});

	it("requires a non-empty address within 500 chars", () => {
		expect(
			tourOperatorSchema.safeParse({ ...valid, address: "" }).success,
		).toBe(false);
		expect(
			tourOperatorSchema.safeParse({ ...valid, address: "x".repeat(501) })
				.success,
		).toBe(false);
	});
});
