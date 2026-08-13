import { z } from "zod";
import * as m from "#/paraglide/messages";
import { addressSchema } from "./address";

// Mirrors the backend value objects. Phone imposes no format (it is printed in a
// footer, not dialled) and email is checked loosely — a stricter grammar would
// reject addresses that work.
//
// Empty stays "" rather than collapsing to null: the backend clears an optional
// column with a blank string, not an absent field.
export const operatorDetailsSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, m.validation_min_length({ count: 2 }))
		.max(150, m.validation_max_length({ count: 150 })),
	// Structured since backend V15 — a NOT NULL column, so the PATCH replaces it
	// whole rather than patching fields inside it.
	address: addressSchema,
	phone: z
		.string()
		.trim()
		.max(30, m.validation_max_length({ count: 30 })),
	email: z
		.string()
		.trim()
		.max(320, m.validation_max_length({ count: 320 }))
		.refine(
			(v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
			m.validation_email(),
		),
	timezoneId: z.string().min(1, m.validation_required()),
	currencyId: z.string().min(1, m.validation_required()),
});

export type OperatorDetailsFormData = z.infer<typeof operatorDetailsSchema>;
