import { z } from "zod";
import * as m from "#/paraglide/messages";

export const storefrontPasswordSchema = z
	.object({
		enabled: z.boolean(),
		password: z
			.string()
			.trim()
			.max(100, m.validation_max_length({ count: 100 })),
		message: z
			.string()
			.trim()
			.max(1000, m.validation_max_length({ count: 1000 })),
	})
	.refine((v) => !v.enabled || v.password.length > 0, {
		path: ["password"],
		message: m.store_access_password_required(),
	});

export type StorefrontPasswordFormData = z.infer<
	typeof storefrontPasswordSchema
>;
