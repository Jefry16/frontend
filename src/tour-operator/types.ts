// What a storefront page falls back to when its locale carries no override.
export interface OperatorSeo {
	seoTitle: string | null;
	seoDescription: string | null;
	ogImageMediaId: string | null;
}

// Null means "not translated in this locale", not "blank" — the canonical
// operator value renders instead.
export interface OperatorTranslation {
	locale: string;
	seoTitle: string | null;
	seoDescription: string | null;
	passwordMessage: string | null;
	slogan: string | null;
	shortDescription: string | null;
}

interface BrandColor {
	/** Operator-chosen hex. */
	background: string;
	foreground: string;
}

interface BrandSocialLink {
	platform: string;
	url: string;
}

/**
 * Modelled whole even though this release edits only the images, slogan and
 * short description: **PUT is a full replace**, so every write has to echo
 * `colors` and `socialLinks` back untouched or it silently wipes them.
 */
export interface Brand {
	slogan: string | null;
	shortDescription: string | null;
	logoMediaId: string | null;
	squareLogoMediaId: string | null;
	faviconMediaId: string | null;
	coverImageMediaId: string | null;
	colors: { primary: BrandColor[]; secondary: BrandColor[] };
	socialLinks: BrandSocialLink[];
}

export type BrandImageSlot =
	| "logoMediaId"
	| "squareLogoMediaId"
	| "faviconMediaId"
	| "coverImageMediaId";

export interface TourOperatorDetails {
	id: string;
	context: "tour-operators";
	name: string;
	/** Read-only, and absent from PATCH: it is the storefront subdomain. */
	handle: string;
	address: string;
	phone: string | null;
	email: string | null;
	timezoneId: string;
	currencyId: string;
	createdAt: string;
	updatedAt: string;
}
