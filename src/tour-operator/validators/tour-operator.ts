import { z } from "zod";
import * as m from "#/paraglide/messages";

// Mirrors the backend value objects (touroperator/domain/valueobject):
// TourOperatorName (2–150 after trim), TourOperatorAddress (≤500 after trim).
// Keeping these in lockstep rejects a bad field client-side with a precise
// message instead of an opaque 422.
export const tourOperatorSchema = z.object({
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
	timezoneId: z.string().min(1, m.validation_required()),
	currencyId: z.string().min(1, m.validation_required()),
});

export type TourOperatorFormData = z.infer<typeof tourOperatorSchema>;
