import { z } from "zod";
import * as m from "#/paraglide/messages";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Mirrors the backend value objects: title 1–255, handle Slug-shaped ≤170,
// body ≤256 KiB raw HTML (sent verbatim), SEO title ≤70 / description ≤320
// (empty collapses to null so the backend stores absence, not a blank).
const optionalText = (max: number) =>
	z
		.string()
		.transform((v) => v.trim())
		.pipe(z.string().max(max, m.validation_max_length({ count: max })))
		.transform((v): string | null => (v.length ? v : null));

const optionalSlug = z
	.string()
	.transform((v) => v.trim())
	.pipe(
		z
			.string()
			.max(170, m.validation_max_length({ count: 170 }))
			.refine((v) => v === "" || SLUG_RE.test(v), m.validation_slug()),
	)
	.transform((v): string | null => (v.length ? v : null));

const requiredHandle = z
	.string()
	.trim()
	.min(1, m.validation_required())
	.max(170, m.validation_max_length({ count: 170 }))
	.refine((v) => SLUG_RE.test(v), m.validation_slug());

/**
 * One schema for both modes, so the form's data type stays single. The handle
 * is validated only on CREATE (edit never sends it — renames are a separate
 * deliberate action); the hook picks the mode's fields for the payload.
 */
export const pageFormSchema = (isEdit: boolean) =>
	z.object({
		title: z
			.string()
			.trim()
			.min(1, m.validation_required())
			.max(255, m.validation_max_length({ count: 255 })),
		handle: isEdit ? z.string() : requiredHandle,
		body: z
			.string()
			.min(1, m.validation_required())
			.max(262_144, m.validation_max_length({ count: 262_144 })),
		seoTitle: optionalText(70),
		seoDescription: optionalText(320),
		templateSuffix: optionalSlug,
	});

export type PageFormData = z.input<ReturnType<typeof pageFormSchema>>;
export type PageFormFields = z.output<ReturnType<typeof pageFormSchema>>;
