import { z } from "zod";
import * as m from "#/paraglide/messages";

// Mirrors the backend value objects: BrandSlogan 80, BrandShortDescription 150
// — the same bounds the operator-translation schema already cites for their
// per-locale overlays.
export const brandTextSchema = z.object({
	slogan: z
		.string()
		.trim()
		.max(80, m.validation_max_length({ count: 80 })),
	shortDescription: z
		.string()
		.trim()
		.max(150, m.validation_max_length({ count: 150 })),
});

export type BrandTextFormData = z.infer<typeof brandTextSchema>;
