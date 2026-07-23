import { z } from "zod";
import * as m from "#/paraglide/messages";

// Mirrors the backend InviteTeamMemberRequest: the invitee's name + email + an
// invite role. name is the inviter's label (greets the email, shows in the
// pending list). OWNER is never invitable (transfer-only, backend 422).
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
