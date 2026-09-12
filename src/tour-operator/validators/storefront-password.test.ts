import { describe, expect, it } from "vitest";
import { storefrontPasswordSchema } from "./storefront-password";

const valid = { enabled: true, password: "visitors", message: "" };

describe("storefrontPasswordSchema", () => {
	it("refuses enabling with no password, and allows disabling without one", () => {
		expect(
			storefrontPasswordSchema.safeParse({ ...valid, password: "" }).success,
		).toBe(false);
		expect(
			storefrontPasswordSchema.safeParse({
				...valid,
				enabled: false,
				password: "",
			}).success,
		).toBe(true);
	});

	it.each([
		["password", 100],
		["message", 1000],
	])("takes %s at the backend's %i-character bound and refuses one past it", (field, max) => {
		const at = { ...valid, [field]: "x".repeat(max) };
		const past = { ...valid, [field]: "x".repeat(max + 1) };
		expect(storefrontPasswordSchema.safeParse(at).success).toBe(true);
		expect(storefrontPasswordSchema.safeParse(past).success).toBe(false);
	});
});
