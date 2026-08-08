import { describe, expect, it } from "vitest";
import { operatorDetailsSchema } from "./operator-details";

const valid = {
	name: "Acme Tours",
	address: "12 Malecón, Sosúa",
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

	it("accepts a loosely-shaped address, matching the backend's check", () => {
		expect(
			operatorDetailsSchema.parse({ ...valid, email: "hola@acme.do" }).email,
		).toBe("hola@acme.do");
		expect(
			operatorDetailsSchema.safeParse({ ...valid, email: "not-an-address" })
				.success,
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
