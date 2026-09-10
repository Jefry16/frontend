import { z } from "zod";
import * as m from "#/paraglide/messages";
import { passwordSchema } from "./password";

export const registerSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, m.validation_min_length({ count: 2 }))
			.max(100, m.validation_max_length({ count: 100 })),
		email: z
			.email(m.validation_email())
			.min(1, m.validation_required())
			.max(255, m.validation_max_length({ count: 255 })),
		password: passwordSchema,
		confirmPassword: z.string().min(1, m.validation_required()),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: m.passwords_dont_match(),
		path: ["confirmPassword"],
	});

export type RegisterFormData = z.infer<typeof registerSchema>;
