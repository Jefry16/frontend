import { z } from "zod";
import * as m from "#/paraglide/messages";

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
