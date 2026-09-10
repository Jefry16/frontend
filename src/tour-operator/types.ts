import type { OperatorLocales } from "#/session";
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

export interface BrandColor {
	/** Operator-chosen hex. */
	background: string;
	foreground: string;
}

export interface BrandSocialLink {
	platform: string;
	url: string;
}

/**
 * **PUT is a full replace**, so every write has to echo back the parts it does
 * not edit or it silently wipes them — and four cards on Settings → General now
 * edit different parts of this one object. That is why nothing sends a
 * hand-built body: `putMerged` re-reads the brand and merges, so a card only
 * ever states its own change.
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
 * and `countryName` are read-only and absent from every write: since V17 the
 * country is the timezone's country, not a field of the address.
 */
export interface OperatorAddress {
	address1: string;
	address2: string | null;
	city: string;
	province: string | null;
	zip: string | null;
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
	/**
	 * A section of the operator, not a resource of its own — its route was folded
	 * into this one. Never null: an operator that has never saved a brand reads
	 * null texts and empty colour arrays.
	 */
	brand: Brand;
	seo: OperatorSeo;
	locales: OperatorLocales;
	storefrontPassword: StorefrontPasswordSettings;
}

/**
 * The storefront gate. Member-visible WITH the password, deliberately: it is
 * something the operator hands to visitors, not a credential. Sending a blank
 * one keeps whatever is stored, so this can be changed but never cleared.
 */
export interface StorefrontPasswordSettings {
	enabled: boolean;
	password: string | null;
	message: string | null;
}
