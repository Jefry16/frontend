import * as m from "#/paraglide/messages";

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
