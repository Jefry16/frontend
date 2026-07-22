import { describe, expect, it } from "vitest";
import { resetPasswordSchema } from "./reset-password";

const VALID = "Str0ng!Pass";

describe("resetPasswordSchema", () => {
	it("accepts a strong password with matching confirmation", () => {
		const result = resetPasswordSchema.safeParse({
			password: VALID,
			confirmPassword: VALID,
		});
		expect(result.success).toBe(true);
	});

	it("rejects when the confirmation doesn't match", () => {
		const result = resetPasswordSchema.safeParse({
			password: VALID,
			confirmPassword: "Different1!",
		});
		expect(result.success).toBe(false);
		// The mismatch is reported on confirmPassword (so it renders under it).
		expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
	});

	it("enforces the shared password policy (weak password fails)", () => {
		const result = resetPasswordSchema.safeParse({
			password: "weak",
			confirmPassword: "weak",
		});
		expect(result.success).toBe(false);
	});
});
