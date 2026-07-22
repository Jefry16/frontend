import { z } from "zod";
import * as m from "#/paraglide/messages";

// Just the email (mirrors the backend Email value object's ≤255 cap, like
// login/register). The endpoint is anti-enumeration — it returns 204 whether or
// not the address exists — so there is nothing else to validate here.
export const forgotPasswordSchema = z.object({
	email: z
		.email(m.validation_email())
		.min(1, m.validation_required())
		.max(255, m.validation_max_length({ count: 255 })),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
