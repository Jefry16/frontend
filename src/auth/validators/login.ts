import { z } from "zod";
import * as m from "#/paraglide/messages";

// Email mirrors the backend Email value object's ≤255 cap (like register), so
// an over-long address is rejected client-side with a precise message instead
// of an opaque 422. Password is presence-only on purpose: the policy is only
// enforced where a password is SET (register/reset) — existing passwords may
// predate it.
export const loginSchema = z.object({
	email: z
		.email(m.validation_email())
		.min(1, m.validation_required())
		.max(255, m.validation_max_length({ count: 255 })),
	password: z.string().min(1, m.validation_required()),
});

export type LoginFormData = z.infer<typeof loginSchema>;
