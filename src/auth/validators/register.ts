import { z } from "zod";
import * as m from "#/paraglide/messages";
import { passwordSchema } from "./password";

// Mirrors the backend value objects (identity/domain/valueobject):
// UserName (2–100 after trim), Email (≤255), Password (see passwordSchema).
// Keeping these in lockstep means a bad field is rejected client-side with a
// precise message instead of coming back as an opaque 422 from the server.
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
