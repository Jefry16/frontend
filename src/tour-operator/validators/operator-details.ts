import { z } from "zod";
import * as m from "#/paraglide/messages";

// Mirrors the backend value objects (touroperator/domain/valueobject):
// TourOperatorName 2–150, TourOperatorAddress 1–500, TourOperatorPhone ≤30 with
// no format imposed (it is printed in a storefront footer, not dialled), and
// TourOperatorEmail ≤320 checked loosely — one @, a dot in the domain, no
// whitespace. A stricter grammar would reject addresses that work.
//
// Phone and email are OPTIONAL columns, and the backend clears one with a blank
// string rather than an absent field, so empty stays "" here instead of
// collapsing to null.
export const operatorDetailsSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, m.validation_min_length({ count: 2 }))
		.max(150, m.validation_max_length({ count: 150 })),
	address: z
		.string()
		.trim()
		.min(1, m.validation_required())
		.max(500, m.validation_max_length({ count: 500 })),
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
