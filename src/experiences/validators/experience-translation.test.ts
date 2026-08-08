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
});
