import { z } from "zod";
import * as m from "#/paraglide/messages";
import { SOCIAL_PLATFORMS } from "../social-platforms";

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

/**
 * `HexColor`: six digits, lower case. Three-digit shorthand is **rejected, not
 * expanded** — the column is `VARCHAR(7)` and the backend would rather refuse
 * than store a value that round-trips differently from what was sent. Case is
 * folded here as well as server-side so the box shows what will be stored.
 */
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

/**
 * `SocialUrl`: http and https only, because the value is rendered as a link on a
 * public page — `javascript:` and `data:` are not links.
 */
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
		// The table's key is (operator, platform). The form filters used platforms
		// out of each row's options, so this catches the case the UI cannot — a
		// row whose platform was picked before an earlier row changed to match it.
		.refine(
			(links) => new Set(links.map((l) => l.platform)).size === links.length,
			m.validation_social_duplicate(),
		),
});

export type BrandSocialLinksFormData = z.infer<typeof brandSocialLinksSchema>;
