import { z } from "zod";
import * as m from "#/paraglide/messages";

export const categorySchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, m.validation_required())
		.max(80, m.validation_max_length({ count: 80 })),
});

export type CategoryFormData = z.input<typeof categorySchema>;
export type CategoryFields = z.output<typeof categorySchema>;
