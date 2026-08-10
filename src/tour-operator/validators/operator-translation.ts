import { z } from "zod";
import * as m from "#/paraglide/messages";

// Empty collapses to null, so the PUT stores absence and the locale falls back.
const text = (max: number) =>
	z
		.string()
		.transform((v) => v.trim())
		.pipe(z.string().max(max, m.validation_max_length({ count: max })))
		.transform((v): string | null => (v.length ? v : null));

// Caps mirror the backend value objects. `passwordMessage` has none — its column
// is TEXT — so it is trimmed and emptied only.
export const operatorTranslationSchema = z.object({
	slogan: text(80),
	shortDescription: text(150),
	seoTitle: text(70),
	seoDescription: text(320),
	passwordMessage: z
		.string()
		.transform((v) => v.trim())
		.transform((v): string | null => (v.length ? v : null)),
});

export type OperatorTranslationFormData = z.input<
	typeof operatorTranslationSchema
>;
export type OperatorTranslationPayload = z.output<
	typeof operatorTranslationSchema
>;
