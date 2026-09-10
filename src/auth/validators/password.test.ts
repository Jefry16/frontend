import { describe, expect, it } from "vitest";
import { passwordSchema } from "./password";

const ok = (v: string) => passwordSchema.safeParse(v).success;

describe("passwordSchema", () => {
	it("accepts a strong password", () => {
		expect(ok("Password1!")).toBe(true);
	});

	it("rejects when too short", () => {
		expect(ok("Pa1!")).toBe(false);
	});

	it("requires upper, lower, number and special", () => {
		expect(ok("password1!")).toBe(false);
		expect(ok("PASSWORD1!")).toBe(false);
		expect(ok("Password!!")).toBe(false);
		expect(ok("Password11")).toBe(false);
	});

	it("rejects passwords over 72 UTF-8 bytes", () => {
		expect(ok(`${"Aa1!".repeat(18)}x`)).toBe(false);
	});
});
