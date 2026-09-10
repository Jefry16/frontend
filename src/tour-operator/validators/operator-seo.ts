import { z } from "zod";
import * as m from "#/paraglide/messages";

export const operatorSeoSchema = z.object({
	seoTitle: z
		.string()
		.trim()
		.max(70, m.validation_max_length({ count: 70 })),
	seoDescription: z
		.string()
		.trim()
		.max(320, m.validation_max_length({ count: 320 })),
});

export type OperatorSeoFormData = z.infer<typeof operatorSeoSchema>;
