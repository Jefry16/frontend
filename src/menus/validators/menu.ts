import { z } from "zod";
import * as m from "#/paraglide/messages";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const menuSchema = z.object({
	handle: z
		.string()
		.trim()
		.min(1, m.validation_required())
		.max(170, m.validation_max_length({ count: 170 }))
		.regex(SLUG, m.validation_slug()),
	title: z
		.string()
		.trim()
		.min(1, m.validation_required())
		.max(120, m.validation_max_length({ count: 120 })),
});

export type MenuFormData = z.input<typeof menuSchema>;

export const deriveHandle = (title: string): string =>
	title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 170);
