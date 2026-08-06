import { z } from "zod";
import * as m from "#/paraglide/messages";

// Every field optional: trim, cap at the canonical value object's max, collapse
// empty to null so the PUT stores absence and the locale falls back to the
// canonical operator text.
const text = (max: number) =>
	z
		.string()
		.transform((v) => v.trim())
		.pipe(z.string().max(max, m.validation_max_length({ count: max })))
		.transform((v): string | null => (v.length ? v : null));

// The caps mirror the backend value objects: OperatorSeoTitle 70,
// OperatorSeoDescription 320, BrandSlogan 80, BrandShortDescription 150.
// `passwordMessage` has no value object and no cap — its column is TEXT — so it
// is trimmed and emptied only.
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
