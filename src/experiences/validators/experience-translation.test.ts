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
	// The payload goes straight to PUT .../translations/{locale}, whose backend
	// record is UpsertExperienceTranslationInput — it reads `handle`. This was
	// `slug` for a while: Jackson dropped the unknown key, bound handle to null,
	// and because the upsert is a full replace, every save wiped the localized
	// handle. Nothing failed, which is why the key is asserted here.
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

	// The same full-replace trap the handle comment describes, on the pair that
	// backend #145 made readable: the overlay's PUT rebuilds the row, so the
	// payload has to carry them or a save clears the locale's SEO.
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
