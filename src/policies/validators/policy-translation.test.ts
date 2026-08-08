import { describe, expect, it } from "vitest";
import { policyTranslationSchema } from "./policy-translation";

const blank = { title: "", body: "" };

describe("policyTranslationSchema", () => {
	it("collapses empty and whitespace-only fields to null", () => {
		// The fallback rule: null stores absence, so the storefront renders the
		// canonical policy. Storing "" would blank the field for that locale.
		expect(policyTranslationSchema.parse(blank)).toEqual({
			title: null,
			body: null,
		});
		expect(
			policyTranslationSchema.parse({ ...blank, title: "  \n\t " }).title,
		).toBeNull();
	});

	it("trims a value it keeps", () => {
		expect(
			policyTranslationSchema.parse({ ...blank, title: "  Cancelación  " })
				.title,
		).toBe("Cancelación");
	});

	it("caps title at the canonical PolicyTitle's 200", () => {
		expect(
			policyTranslationSchema.safeParse({ ...blank, title: "x".repeat(200) })
				.success,
		).toBe(true);
		expect(
			policyTranslationSchema.safeParse({ ...blank, title: "x".repeat(201) })
				.success,
		).toBe(false);
	});

	it("allows a body far past the title cap — it is a document", () => {
		const long = "<p>x</p>".repeat(5_000);
		expect(policyTranslationSchema.parse({ ...blank, body: long }).body).toBe(
			long,
		);
	});
});
