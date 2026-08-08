import { z } from "zod";
import * as m from "#/paraglide/messages";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// An optional translated text field: trim, enforce the canonical value object's
// max length, then collapse an empty value to `null` so the PUT omits it and the
// locale falls back to the canonical text (sending "" would fail the backend's
// non-blank check).
const text = (max: number) =>
	z
		.string()
		.transform((v) => v.trim())
		.pipe(z.string().max(max, m.validation_max_length({ count: max })))
		.transform((v): string | null => (v.length ? v : null));

// Optional localized handle: empty → null (fall back to canonical). When present
// it must be kebab-case and ≤170, mirroring the backend Slug value object.
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

// Array items arrive already trimmed + non-empty from AppArrayInput; only the
// per-item length bound (Highlight / InclusionItem ≤200) needs enforcing. An
// empty array is sent as-is; the backend stores it as null (→ canonical).
const items = z.array(
	z.string().max(200, m.validation_max_length({ count: 200 })),
);

// Every field optional — a translation may localize only some fields, leaving
// the rest to fall back to the canonical value.
export const experienceTranslationSchema = z.object({
	name: text(200),
	description: text(500),
	longDescription: text(10000),
	highlights: items,
	included: items,
	notIncluded: items,
	handle,
});

export type ExperienceTranslationFormData = z.input<
	typeof experienceTranslationSchema
>;
export type ExperienceTranslationPayload = z.output<
	typeof experienceTranslationSchema
>;
