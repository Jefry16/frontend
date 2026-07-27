import { z } from "zod";
import * as m from "#/paraglide/messages";

// Mirrors the backend value objects: namespace/key are hyphen slugs ≤64,
// name 1–120 after trim, description ≤500 (blank → omitted). ownerType/type
// are the wire codes; both are immutable after create, so the edit form only
// submits name/description.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugField = z
	.string()
	.trim()
	.min(1, m.validation_required())
	.max(64, m.validation_max_length({ count: 64 }))
	.regex(SLUG, m.validation_slug());

export const definitionSchema = z.object({
	ownerType: z.enum(["experience", "page"], m.validation_required()),
	namespace: slugField,
	key: slugField,
	type: z.enum(
		[
			"single_line_text",
			"multi_line_text",
			"number_integer",
			"number_decimal",
			"boolean",
			"date",
			"url",
			"json",
		],
		m.validation_required(),
	),
	name: z
		.string()
		.trim()
		.min(1, m.validation_required())
		.max(120, m.validation_max_length({ count: 120 })),
	description: z
		.string()
		.trim()
		.max(500, m.validation_max_length({ count: 500 })),
});

export type DefinitionFormData = z.input<typeof definitionSchema>;
export type DefinitionFields = z.output<typeof definitionSchema>;

/** Name → suggested key, Shopify-style: "Care instructions" → "care-instructions". */
export const deriveKey = (name: string): string =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 64);
