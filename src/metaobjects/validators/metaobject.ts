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

// Create mode also defines the initial field set. The uniqueness rule lives
// here rather than in a hand-rolled loop in the component, so a duplicate key
// reports on the offending row instead of as one banner above the form.
export const definitionCreateSchema = definitionSchema.extend({
	fields: z
		.array(fieldSchema.extend({ type: z.string().min(1) }))
		.min(1, m.validation_required())
		.superRefine((rows, ctx) => {
			const seen = new Map<string, number>();
			rows.forEach((row, index) => {
				const first = seen.get(row.key);
				if (first === undefined) {
					seen.set(row.key, index);
					return;
				}
				ctx.addIssue({
					code: "custom",
					path: [index, "key"],
					message: m.metaobject_fields_duplicate_key(),
				});
			});
		}),
});

// Edit carries the same value shape so one form type serves both modes, but
// `fields` is empty and unchecked — the field set is managed on the detail page.
export const definitionEditSchema = definitionSchema.extend({
	fields: z.array(fieldSchema.extend({ type: z.string() })),
});

export type DefinitionCreateFormData = z.input<typeof definitionCreateSchema>;

export const entrySchema = z.object({
	handle: slugField(170),
	name: nameField,
});

export type DefinitionFormData = z.input<typeof definitionSchema>;

/** Name → suggested slug: "Size chart" → "size-chart". */
export const deriveSlug = (name: string): string =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 64);
