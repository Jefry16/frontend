import { z } from "zod";
import * as m from "#/paraglide/messages";
import { passwordSchema } from "./password";

// The anonymous accept branch provisions a new account, so it needs a name +
// password (same policy as register). An already-authenticated accepter sends no
// body — their account is the identity.
export const acceptInvitationSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, m.validation_min_length({ count: 2 }))
		.max(100, m.validation_max_length({ count: 100 })),
	password: passwordSchema,
});

export type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;
