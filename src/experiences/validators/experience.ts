import { z } from "zod";
import * as m from "#/paraglide/messages";

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max, m.validation_max_length({ count: max }));

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
	startingPrice: z
		.string()
		.min(1, m.validation_required())
		.transform(Number)
		.pipe(
			z
				.number()
				.positive(m.validation_min_value({ count: 0 }))
				.lt(10_000_000_000, m.validation_max_value({ count: 10_000_000_000 })),
		),
	featured: z.boolean(),
	thumbnailMediaId: z.string().nullable(),
	mediaIds: z.array(z.string()),
	seoTitle: optionalText(70),
	seoDescription: optionalText(320),
});

export type ExperienceFormData = z.input<typeof experienceSchema>;
export type ExperienceFields = z.output<typeof experienceSchema>;
