import { z } from "zod";
import * as m from "#/paraglide/messages";

// Single source of truth for the password policy, mirroring the backend
// Password value object (identity/domain/valueobject/Password.java): ≥8 chars,
// ≤72 UTF-8 bytes (BCrypt's limit), and at least one upper, lower, digit and
// special character. Shared by register and reset-password so the two flows
// can never drift from each other or from the server.
export const passwordSchema = z
	.string()
	.min(8, m.validation_min_length({ count: 8 }))
	.regex(/[A-Z]/, m.validation_password_uppercase())
	.regex(/[a-z]/, m.validation_password_lowercase())
	.regex(/[0-9]/, m.validation_password_number())
	.regex(/[^A-Za-z0-9]/, m.validation_password_special())
	.refine(
		(value) => new TextEncoder().encode(value).length <= 72,
		m.validation_password_too_long(),
	);
