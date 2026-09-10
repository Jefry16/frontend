import { z } from "zod";
import * as m from "#/paraglide/messages";
import { passwordSchema } from "./password";

export const resetPasswordSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: z.string().min(1, m.validation_required()),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: m.passwords_dont_match(),
		path: ["confirmPassword"],
	});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
