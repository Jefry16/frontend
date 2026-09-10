import { describe, expect, it } from "vitest";
import { operatorTranslationSchema } from "./operator-translation";

const blank = {
	slogan: "",
	shortDescription: "",
	seoTitle: "",
	seoDescription: "",
	passwordMessage: "",
};

const CAPS = [
	["slogan", 80],
	["shortDescription", 150],
	["seoTitle", 70],
	["seoDescription", 320],
] as const;

describe("operatorTranslationSchema", () => {
	it("collapses empty and whitespace-only fields to null", () => {
		expect(operatorTranslationSchema.parse(blank)).toEqual({
			slogan: null,
			shortDescription: null,
			seoTitle: null,
			seoDescription: null,
			passwordMessage: null,
		});
		expect(
			operatorTranslationSchema.parse({ ...blank, slogan: "   \n\t " }).slogan,
		).toBeNull();
	});

	it("trims a value it keeps", () => {
		expect(
			operatorTranslationSchema.parse({ ...blank, slogan: "  Sail more  " })
				.slogan,
		).toBe("Sail more");
	});

	it.each(CAPS)("accepts %s at %i chars and rejects one more", (field, max) => {
		expect(
			operatorTranslationSchema.safeParse({
				...blank,
				[field]: "x".repeat(max),
			}).success,
		).toBe(true);
		expect(
			operatorTranslationSchema.safeParse({
				...blank,
				[field]: "x".repeat(max + 1),
			}).success,
		).toBe(false);
	});

	it("leaves passwordMessage uncapped — its column is TEXT with no value object", () => {
		const long = "x".repeat(5_000);
		expect(
			operatorTranslationSchema.parse({ ...blank, passwordMessage: long })
				.passwordMessage,
		).toBe(long);
	});

	it("caps each field independently", () => {
		const result = operatorTranslationSchema.safeParse({
			...blank,
			slogan: "x".repeat(81),
			seoTitle: "Fine",
		});
		expect(result.success).toBe(false);
		expect(result.error?.issues.map((i) => i.path[0])).toEqual(["slogan"]);
	});
});
