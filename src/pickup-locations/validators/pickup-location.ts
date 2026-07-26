import { z } from "zod";
import * as m from "#/paraglide/messages";

// Mirrors the backend value objects: PickupLocationName 1–200 after trim;
// PickupLocationTime a strict HH:mm (two-digit 24h — LocalTime.parse rejects
// single-digit hours, so the schema does too).
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const pickupLocationSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, m.validation_required())
		.max(200, m.validation_max_length({ count: 200 })),
	time: z
		.string()
		.trim()
		.min(1, m.validation_required())
		.regex(TIME_RE, m.validation_time()),
});

export type PickupLocationFormData = z.input<typeof pickupLocationSchema>;
export type PickupLocationFields = z.output<typeof pickupLocationSchema>;
