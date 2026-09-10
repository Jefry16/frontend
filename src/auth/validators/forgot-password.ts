import { z } from "zod";
import * as m from "#/paraglide/messages";

export const forgotPasswordSchema = z.object({
	email: z
		.email(m.validation_email())
		.min(1, m.validation_required())
		.max(255, m.validation_max_length({ count: 255 })),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
