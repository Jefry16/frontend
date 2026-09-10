import { z } from "zod";
import * as m from "#/paraglide/messages";

export const loginSchema = z.object({
	email: z
		.email(m.validation_email())
		.min(1, m.validation_required())
		.max(255, m.validation_max_length({ count: 255 })),
	password: z.string().min(1, m.validation_required()),
});

export type LoginFormData = z.infer<typeof loginSchema>;
