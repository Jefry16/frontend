import { z } from "zod";
import * as m from "#/paraglide/messages";

// Mirrors the backend rules on PATCH /locales: at least one supported language,
// a primary language, and the primary must be one of the supported set (server
// returns 422 otherwise — we reject client-side with a precise message first).
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
