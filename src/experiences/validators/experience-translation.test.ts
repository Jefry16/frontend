import { describe, expect, it } from "vitest";
import { experienceTranslationSchema } from "./experience-translation";

const blank = {
	name: "",
	description: "",
	longDescription: "",
	highlights: [],
	included: [],
	notIncluded: [],
	handle: "",
	seoTitle: "",
	seoDescription: "",
};

describe("experienceTranslationSchema", () => {
	it("emits the localized handle under the key the backend binds", () => {
		const parsed = experienceTranslationSchema.parse({
			...blank,
			handle: "excursion-al-limon",
		});

		expect(parsed).toHaveProperty("handle", "excursion-al-limon");
		expect(parsed).not.toHaveProperty("slug");
	});

	it("collapses an empty handle to null so the canonical one serves", () => {
		expect(experienceTranslationSchema.parse(blank).handle).toBeNull();
	});

	it("carries the SEO pair, collapsing blanks to null", () => {
		expect(experienceTranslationSchema.parse(blank)).toMatchObject({
			seoTitle: null,
			seoDescription: null,
		});
		expect(
			experienceTranslationSchema.parse({
				...blank,
				seoTitle: "  Excursión al Limón  ",
			}).seoTitle,
		).toBe("Excursión al Limón");
	});
});
