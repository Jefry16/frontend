import { describe, expect, it } from "vitest";
import { definitionCreateSchema, deriveSlug } from "./metaobject";

const base = { type: "size-chart", name: "Size chart", description: "" };
const row = (key: string, name = "Label") => ({
	key,
	name,
	type: "single_line_text",
});

describe("definitionCreateSchema", () => {
	it("reports a duplicate key on the row that repeats it", () => {
		const result = definitionCreateSchema.safeParse({
			...base,
			fields: [row("width"), row("height"), row("width")],
		});

		expect(result.success).toBe(false);
		const paths = result.error?.issues.map((i) => i.path.join("."));
		expect(paths).toContain("fields.2.key");
		expect(paths).not.toContain("fields.0.key");
	});

	it("rejects an incomplete row", () => {
		expect(
			definitionCreateSchema.safeParse({ ...base, fields: [row("", "")] })
				.success,
		).toBe(false);
	});

	it("rejects a key that is not a slug", () => {
		expect(
			definitionCreateSchema.safeParse({ ...base, fields: [row("Not A Slug")] })
				.success,
		).toBe(false);
	});

	it("accepts distinct slug-shaped rows", () => {
		expect(
			definitionCreateSchema.safeParse({
				...base,
				fields: [row("width"), row("height")],
			}).success,
		).toBe(true);
	});

	it("derives a key from a name the way the blur listener does", () => {
		expect(deriveSlug("Size chart")).toBe("size-chart");
	});
});
