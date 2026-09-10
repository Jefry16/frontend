import { describe, expect, it } from "vitest";
import { tourOperatorSchema } from "./tour-operator";

const valid = {
	name: "Acme Tours",
	address: {
		address1: "Calle Mayor 1",
		address2: "",
		city: "Madrid",
		province: "Madrid",
		zip: "28013",
	},
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

	it("requires address1 and city — the backend's NOT NULL parts", () => {
		for (const missing of ["address1", "city"] as const) {
			expect(
				tourOperatorSchema.safeParse({
					...valid,
					address: { ...valid.address, [missing]: "" },
				}).success,
			).toBe(false);
		}
	});

	it("leaves the optional address parts optional", () => {
		expect(
			tourOperatorSchema.safeParse({
				...valid,
				address: { ...valid.address, address2: "", province: "", zip: "" },
			}).success,
		).toBe(true);
	});
});
