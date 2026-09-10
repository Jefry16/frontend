import { z } from "zod";
import * as m from "#/paraglide/messages";

const overlay = (max: number) =>
	z
		.string()
		.transform((v) => v.trim())
		.pipe(z.string().max(max, m.validation_max_length({ count: max })))
		.transform((v): string | null => (v.length ? v : null));

export const policyTranslationSchema = z.object({
	title: overlay(200),
	body: overlay(262_144),
});

export type PolicyTranslationFormData = z.input<typeof policyTranslationSchema>;
export type PolicyTranslationPayload = z.output<typeof policyTranslationSchema>;
