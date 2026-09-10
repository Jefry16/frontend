import { z } from "zod";
import * as m from "#/paraglide/messages";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const text = (max: number) =>
	z
		.string()
		.transform((v) => v.trim())
		.pipe(z.string().max(max, m.validation_max_length({ count: max })))
		.transform((v): string | null => (v.length ? v : null));

export const pageTranslationSchema = z.object({
	title: text(255),
	body: z
		.string()
		.transform((v) => v.trim())
		.pipe(z.string().max(262_144, m.validation_max_length({ count: 262_144 })))
		.transform((v): string | null => (v.length ? v : null)),
	seoTitle: text(70),
	seoDescription: text(320),
	handle: z
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
