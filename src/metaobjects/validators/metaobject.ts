import { z } from "zod";
import * as m from "#/paraglide/messages";

// Mirrors the backend value objects: definition type is a hyphen slug ≤64,
// field keys hyphen slugs ≤64, entry handles shared-Slug-shaped ≤170, display
// names 1–120 after trim, description ≤500 (blank → omitted).
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugField = (max: number) =>
	z
		.string()
		.trim()
		.min(1, m.validation_required())
		.max(max, m.validation_max_length({ count: max }))
		.regex(SLUG, m.validation_slug());

const nameField = z
	.string()
	.trim()
	.min(1, m.validation_required())
	.max(120, m.validation_max_length({ count: 120 }));

export const definitionSchema = z.object({
	type: slugField(64),
	name: nameField,
	description: z
		.string()
		.trim()
		.max(500, m.validation_max_length({ count: 500 })),
});

export const fieldSchema = z.object({
	key: slugField(64),
	name: nameField,
});

export const entrySchema = z.object({
	handle: slugField(170),
	name: nameField,
});

export type DefinitionFormData = z.input<typeof definitionSchema>;
export type EntryFormData = z.input<typeof entrySchema>;

/** Name → suggested slug: "Size chart" → "size-chart". */
export const deriveSlug = (name: string): string =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 64);
