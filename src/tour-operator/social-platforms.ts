import * as m from "#/paraglide/messages";

/**
 * The backend's `BrandSocialPlatform`, in the order the picker offers them.
 *
 * **A closed list, and this is the current one.** `touroperator/V10` took
 * Shopify's nine verbatim — Snapchat, Tumblr, Vimeo — and `V11` replaced it
 * with these: an operator picking from a list containing Tumblr is being asked a
 * question about someone else's business, while TripAdvisor is where a tour is
 * reviewed and WhatsApp is the primary contact channel across much of Latin
 * America, southern Europe and southeast Asia. Read V11, never V10.
 *
 * A platform outside this list is a 422 naming it (`platformOf`).
 */
export const SOCIAL_PLATFORMS = [
	"FACEBOOK",
	"INSTAGRAM",
	"TIKTOK",
	"YOUTUBE",
	"TWITTER",
	"PINTEREST",
	"TRIPADVISOR",
	"WHATSAPP",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

// Names rather than icons: lucide has no TripAdvisor or WhatsApp glyph, and a
// list where six platforms have a logo and two have text reads as broken.
const LABELS: Record<SocialPlatform, () => string> = {
	FACEBOOK: m.social_facebook,
	INSTAGRAM: m.social_instagram,
	TIKTOK: m.social_tiktok,
	YOUTUBE: m.social_youtube,
	TWITTER: m.social_twitter,
	PINTEREST: m.social_pinterest,
	TRIPADVISOR: m.social_tripadvisor,
	WHATSAPP: m.social_whatsapp,
};

export const socialPlatformLabel = (platform: string): string =>
	LABELS[platform as SocialPlatform]?.() ?? platform;
