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

/**
 * The operator's postal address, structured since backend V15. `countryCode`
 * and `countryName` are resolved from `countryId` on read and are absent from
 * every write — the request carries the id alone.
 */
export interface OperatorAddress {
	address1: string;
	address2: string | null;
	city: string;
	province: string | null;
	zip: string | null;
	countryId: string;
	countryCode: string;
	countryName: string;
}

export interface TourOperatorDetails {
	id: string;
	context: "tour-operators";
	name: string;
	/** Read-only, and absent from PATCH: it is the storefront subdomain. */
	handle: string;
	address: OperatorAddress;
	phone: string | null;
	email: string | null;
	timezoneId: string;
	currencyId: string;
	createdAt: string;
	updatedAt: string;
}
