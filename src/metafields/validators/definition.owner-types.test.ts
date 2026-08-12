import { describe, expect, it } from "vitest";
import { OWNER_TYPE_OPTIONS } from "../format";
import { METAFIELD_OWNER_TYPES } from "../types";
import { definitionSchema } from "./definition";

const valid = {
	namespace: "operator",
	key: "vat-number",
	type: "single_line_text" as const,
	metaobjectDefinitionId: "",
	name: "VAT number",
	description: "",
};

// The bug this pins: `tour_operator` was added to the union, the label record,
// the endpoint map and the create form's select — but NOT to the validator's
// enum, so choosing it failed with "This field is required" and nothing caught
// it. Every owner type must survive the whole path, not most of it.
describe("metafield owner types stay in step", () => {
	it.each(METAFIELD_OWNER_TYPES)("the validator accepts %s", (ownerType) => {
		expect(definitionSchema.safeParse({ ...valid, ownerType }).success).toBe(
			true,
		);
	});

	it("rejects an owner type that is not in the list", () => {
		expect(
			definitionSchema.safeParse({ ...valid, ownerType: "booking" }).success,
		).toBe(false);
	});

	it("offers exactly the known owner types in the create form", () => {
		expect(OWNER_TYPE_OPTIONS.map((o) => o.value)).toEqual([
			...METAFIELD_OWNER_TYPES,
		]);
		// Every option has a real label, not a raw code echoed back.
		for (const option of OWNER_TYPE_OPTIONS) {
			expect(option.label).not.toBe(option.value);
			expect(option.label.length).toBeGreaterThan(0);
		}
	});
});
