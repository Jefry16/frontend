import { z } from "zod";
import * as m from "#/paraglide/messages";
import { passwordSchema } from "./password";

// Change-password: the current password (to re-authenticate), a new password
// meeting the shared policy, and a confirmation. The new password must differ
// from the current one, and the confirmation must match — both mirrored from the
// backend so a bad field is caught client-side instead of coming back as a 422.
export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, m.validation_required()),
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, m.validation_required()),
	})
	.refine((data) => data.newPassword !== data.currentPassword, {
		message: m.validation_new_password_same(),
		path: ["newPassword"],
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: m.passwords_dont_match(),
		path: ["confirmPassword"],
	});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
