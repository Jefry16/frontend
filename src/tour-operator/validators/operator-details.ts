import { z } from "zod";
import * as m from "#/paraglide/messages";
import { addressSchema } from "./address";

export const operatorDetailsSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, m.validation_min_length({ count: 2 }))
		.max(150, m.validation_max_length({ count: 150 })),
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
