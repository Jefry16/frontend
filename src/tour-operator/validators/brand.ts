import { z } from "zod";
import * as m from "#/paraglide/messages";
import { SOCIAL_PLATFORMS } from "../social-platforms";

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

const hex = z
	.string()
	.trim()
	.toLowerCase()
	.regex(/^#[0-9a-f]{6}$/, m.validation_hex_color());

const color = z.object({ background: hex, foreground: hex });

export const brandColorsSchema = z.object({
	primary: z.array(color),
	secondary: z.array(color),
});

export type BrandColorsFormData = z.infer<typeof brandColorsSchema>;

const socialUrl = z
	.string()
	.trim()
	.max(500, m.validation_max_length({ count: 500 }))
	.refine((v) => /^https?:\/\/\S/.test(v), m.validation_social_url());

export const brandSocialLinksSchema = z.object({
	socialLinks: z
		.array(
			z.object({
				platform: z.enum(SOCIAL_PLATFORMS),
				url: socialUrl,
			}),
		)
		.refine(
			(links) => new Set(links.map((l) => l.platform)).size === links.length,
			m.validation_social_duplicate(),
		),
});

export type BrandSocialLinksFormData = z.infer<typeof brandSocialLinksSchema>;
