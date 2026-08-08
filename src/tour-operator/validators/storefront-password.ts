import { z } from "zod";
import * as m from "#/paraglide/messages";

// Store access: the shared password gate on the storefront. The cross-field
// rule mirrors the backend's — a gate with no password is not a gate — so the
// common mistake fails here instead of round-tripping to a 422.
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
