import { describe, expect, it } from "vitest";
import { operatorDetailsSchema } from "./operator-details";

const valid = {
	name: "Acme Tours",
	address: {
		address1: "Calle Mayor 1",
		address2: "",
		city: "Madrid",
		province: "Madrid",
		zip: "28013",
	},
	phone: "",
	email: "",
	timezoneId: "tz-1",
	currencyId: "cur-1",
};

describe("operatorDetailsSchema", () => {
	// PATCH /tour-operators/{id} clears an optional column on a BLANK string, not
	// an absent field — so empty must survive parsing as "" rather than collapse
	// to null the way every other optional field in this app does.
	it("keeps an empty phone and email as blank, not null", () => {
		const parsed = operatorDetailsSchema.parse(valid);
		expect(parsed.phone).toBe("");
		expect(parsed.email).toBe("");
	});

	it("requires the address parts the column cannot hold empty", () => {
		expect(
			operatorDetailsSchema.safeParse({
				...valid,
				address: { ...valid.address, address1: "" },
			}).success,
		).toBe(false);
	});

	it("holds the backend's bounds", () => {
		expect(
			operatorDetailsSchema.safeParse({ ...valid, name: "A" }).success,
		).toBe(false);
		expect(
			operatorDetailsSchema.safeParse({ ...valid, phone: "x".repeat(31) })
				.success,
		).toBe(false);
		expect(
			operatorDetailsSchema.safeParse({ ...valid, address: "" }).success,
		).toBe(false);
	});
});
