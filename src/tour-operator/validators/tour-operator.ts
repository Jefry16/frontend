import { z } from "zod";
import * as m from "#/paraglide/messages";
import { addressSchema } from "./address";

export const tourOperatorSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, m.validation_min_length({ count: 2 }))
		.max(150, m.validation_max_length({ count: 150 })),
	address: addressSchema,
	timezoneId: z.string().min(1, m.validation_required()),
	currencyId: z.string().min(1, m.validation_required()),
});

export type TourOperatorFormData = z.infer<typeof tourOperatorSchema>;
