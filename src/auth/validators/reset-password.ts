import { z } from "zod";
import * as m from "#/paraglide/messages";
import { passwordSchema } from "./password";

// New password + confirmation. Reuses the shared passwordSchema so the reset
// flow enforces exactly the same policy as register (and the backend Password
// value object). The token lives in the URL, not the form, so it isn't here.
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
