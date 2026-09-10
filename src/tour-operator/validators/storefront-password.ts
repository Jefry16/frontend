import { z } from "zod";
import * as m from "#/paraglide/messages";

export const storefrontPasswordSchema = z
	.object({
		enabled: z.boolean(),
		password: z
			.string()
			.trim()
			.max(72, m.validation_max_length({ count: 72 })),
		message: z
			.string()
			.trim()
			.max(500, m.validation_max_length({ count: 500 })),
	})
	.refine((v) => !v.enabled || v.password.length > 0, {
		path: ["password"],
		message: m.store_access_password_required(),
	});

export type StorefrontPasswordFormData = z.infer<
	typeof storefrontPasswordSchema
>;
