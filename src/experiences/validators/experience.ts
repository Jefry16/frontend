import { z } from "zod";
import * as m from "#/paraglide/messages";

// Bounds mirror the backend value objects: name ≤200, description ≤500,
// longDescription ≤10000, duration 1–14400 min, cutoff 0–8760 h. The content
// arrays (tags / highlights / included / notIncluded) and media aren't in this
// first create form — they default to empty so the payload is still a complete
// ExperienceRequest (null lists are treated as empty by the backend anyway).
export const experienceSchema = z
	.object({
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
	})
	.transform((v) => ({
		...v,
		tags: [] as string[],
		included: [] as string[],
		notIncluded: [] as string[],
		highlights: [] as string[],
		mediaIds: [] as string[],
		thumbnailMediaId: null,
	}));

export type ExperienceFormData = z.input<typeof experienceSchema>;
export type ExperiencePayload = z.output<typeof experienceSchema>;
