import { z } from "zod";
import * as m from "#/paraglide/messages";

export const audienceSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, m.validation_required())
		.max(80, m.validation_max_length({ count: 80 })),
	paxPerUnit: z
		.string()
		.min(1, m.validation_required())
		.transform(Number)
		.pipe(
			z
				.number()
				.int()
				.min(1, m.validation_min_value({ count: 1 })),
		),
});

export type AudienceFormData = z.input<typeof audienceSchema>;
export type AudienceFields = z.output<typeof audienceSchema>;
