import { z } from "zod";
import * as m from "#/paraglide/messages";

export const operatorLocalesSchema = z
	.object({
		primaryLocale: z.string().min(1, m.validation_required()),
		supportedLocales: z
			.array(z.string())
			.min(1, m.validation_select_one_language()),
	})
	.refine((v) => v.supportedLocales.includes(v.primaryLocale), {
		path: ["primaryLocale"],
		message: m.validation_primary_language_supported(),
	});

export type OperatorLocalesFormData = z.infer<typeof operatorLocalesSchema>;
