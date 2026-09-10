import { z } from "zod";
import * as m from "#/paraglide/messages";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const text = (max: number) =>
	z
		.string()
		.transform((v) => v.trim())
		.pipe(z.string().max(max, m.validation_max_length({ count: max })))
		.transform((v): string | null => (v.length ? v : null));

const handle = z
	.string()
	.transform((v) => v.trim())
	.pipe(
		z
			.string()
			.max(170, m.validation_max_length({ count: 170 }))
			.refine((v) => v === "" || SLUG_RE.test(v), m.validation_slug()),
	)
	.transform((v): string | null => (v.length ? v : null));

export const experienceTranslationSchema = z.object({
	name: text(200),
	description: text(500),
	longDescription: text(10000),
	handle,
	seoTitle: text(70),
	seoDescription: text(320),
});

export type ExperienceTranslationFormData = z.input<
	typeof experienceTranslationSchema
>;
export type ExperienceTranslationPayload = z.output<
	typeof experienceTranslationSchema
>;
