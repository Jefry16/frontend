import { z } from "zod";
import * as m from "#/paraglide/messages";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Every field optional: trim, cap at the canonical VO's max, collapse empty to
// null so the PUT stores absence and the locale falls back to canonical.
const text = (max: number) =>
	z
		.string()
		.transform((v) => v.trim())
		.pipe(z.string().max(max, m.validation_max_length({ count: max })))
		.transform((v): string | null => (v.length ? v : null));

export const pageTranslationSchema = z.object({
	title: text(255),
	// Body is raw HTML — trimmed only, never reshaped.
	body: z
		.string()
		.transform((v) => v.trim())
		.pipe(z.string().max(262_144, m.validation_max_length({ count: 262_144 })))
		.transform((v): string | null => (v.length ? v : null)),
	seoTitle: text(70),
	seoDescription: text(320),
	// Localized handle: empty → null (absent w/ a translated title the backend
	// derives one; absent without = canonical serves the locale).
	slug: z
		.string()
		.transform((v) => v.trim())
		.pipe(
			z
				.string()
				.max(170, m.validation_max_length({ count: 170 }))
				.refine((v) => v === "" || SLUG_RE.test(v), m.validation_slug()),
		)
		.transform((v): string | null => (v.length ? v : null)),
});

export type PageTranslationFormData = z.input<typeof pageTranslationSchema>;
export type PageTranslationPayload = z.output<typeof pageTranslationSchema>;
