import { z } from "zod";
import * as m from "#/paraglide/messages";

// Mirrors the backend CategoryName: 1–80 after trim. The value object also
// rejects Unicode control characters, and at create demands one alphanumeric so
// a handle can be generated. Neither is reachable from a keyboard; a paste that
// hits one gets the backend's own message through apiErrorMessage.
export const categorySchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, m.validation_required())
		.max(80, m.validation_max_length({ count: 80 })),
});

export type CategoryFormData = z.input<typeof categorySchema>;
export type CategoryFields = z.output<typeof categorySchema>;
