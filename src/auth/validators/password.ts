import { z } from "zod";
import * as m from "#/paraglide/messages";

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
