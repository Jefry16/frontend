import { z } from "zod";
import * as m from "#/paraglide/messages";

export const inviteSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, m.validation_required())
		.max(255, m.validation_max_length({ count: 255 })),
	email: z
		.email(m.validation_email())
		.min(1, m.validation_required())
		.max(255, m.validation_max_length({ count: 255 })),
	role: z.enum(["ADMIN", "STAFF"]),
});

export type InviteFormData = z.infer<typeof inviteSchema>;
