import type { OperatorLocales } from "#/session";
export interface OperatorSeo {
	seoTitle: string | null;
	seoDescription: string | null;
	ogImageMediaId: string | null;
}

export interface OperatorTranslation {
	locale: string;
	seoTitle: string | null;
	seoDescription: string | null;
	passwordMessage: string | null;
	slogan: string | null;
	shortDescription: string | null;
}

export interface BrandColor {
	background: string;
	foreground: string;
}

export interface BrandSocialLink {
	platform: string;
	url: string;
}

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
	handle: string;
	address: OperatorAddress;
	phone: string | null;
	email: string | null;
	timezoneId: string;
	currencyId: string;
	createdAt: string;
	updatedAt: string;
	brand: Brand;
	seo: OperatorSeo;
	locales: OperatorLocales;
	storefrontPassword: StorefrontPasswordSettings;
}

export interface StorefrontPasswordSettings {
	enabled: boolean;
	password: string | null;
	message: string | null;
}
