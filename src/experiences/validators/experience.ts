import { z } from "zod";
import * as m from "#/paraglide/messages";

// The editable fields of the create/edit form. Bounds mirror the backend value
// objects: name ≤200, description ≤500, longDescription ≤10000, duration
// 1–14400 min, cutoff 0–8760 h. The content arrays (tags / highlights / …) and
// media aren't edited here yet — the form hook carries them through unchanged
// (empty on create, the record's values on edit) so a PATCH never wipes them.
export const experienceSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, m.validation_required())
		.max(200, m.validation_max_length({ count: 200 })),
	description: z
		.string()
		.trim()
		.min(1, m.validation_required())
		.max(500, m.validation_max_length({ count: 500 })),
	longDescription: z
		.string()
		.trim()
		.min(1, m.validation_required())
		.max(10000, m.validation_max_length({ count: 10000 })),
	durationMinutes: z
		.string()
		.min(1, m.validation_required())
		.transform(Number)
		.pipe(
			z
				.number()
				.int()
				.min(1, m.validation_min_value({ count: 1 }))
				.max(14400, m.validation_max_value({ count: 14400 })),
		),
	bookingCutoffHours: z
		.string()
		.min(1, m.validation_required())
		.transform(Number)
		.pipe(
			z
				.number()
				.int()
				.min(0, m.validation_min_value({ count: 0 }))
				.max(8760, m.validation_max_value({ count: 8760 })),
		),
	featured: z.boolean(),
});

export type ExperienceFormData = z.input<typeof experienceSchema>;
export type ExperienceFields = z.output<typeof experienceSchema>;
