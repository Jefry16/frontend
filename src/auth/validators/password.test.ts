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
		expect(ok("password1!")).toBe(false); // no uppercase
		expect(ok("PASSWORD1!")).toBe(false); // no lowercase
		expect(ok("Password!!")).toBe(false); // no number
		expect(ok("Password11")).toBe(false); // no special
	});

	it("rejects passwords over 72 UTF-8 bytes", () => {
		expect(ok(`${"Aa1!".repeat(18)}x`)).toBe(false); // 73 chars
	});
});
