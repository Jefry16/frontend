import { describe, expect, it } from "vitest";
import { loginSchema } from "./login";

describe("loginSchema", () => {
	it("accepts a valid email + non-empty password", () => {
		expect(
			loginSchema.safeParse({ email: "a@b.com", password: "x" }).success,
		).toBe(true);
	});

	it("rejects an invalid email", () => {
		expect(
			loginSchema.safeParse({ email: "not-an-email", password: "x" }).success,
		).toBe(false);
	});

	it("rejects an empty password", () => {
		expect(
			loginSchema.safeParse({ email: "a@b.com", password: "" }).success,
		).toBe(false);
	});

	it("rejects an over-long email (>255)", () => {
		const email = `${"a".repeat(250)}@b.com`;
		expect(loginSchema.safeParse({ email, password: "x" }).success).toBe(false);
	});
});
