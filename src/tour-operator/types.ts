// The shop's own SEO defaults (`GET`/`PUT .../seo`) — what a storefront page
// falls back to when a locale carries no override. `ogImageMediaId` is a media
// id the backend validates against this operator's own library.
export interface OperatorSeo {
	seoTitle: string | null;
	seoDescription: string | null;
	ogImageMediaId: string | null;
}

// The operator's own per-locale overlay (`…/translations/{locale}`) — the
// shop-level text every storefront page falls back to, as opposed to a single
// resource's translations. Every field is nullable: null means "not translated
// in this locale" and the canonical operator value renders instead.
//
// A settings sub-resource keyed by its locale, so no `id`/`context` envelope —
// the same shape the experience and page translation responses use.
export interface OperatorTranslation {
	locale: string;
	seoTitle: string | null;
	seoDescription: string | null;
	passwordMessage: string | null;
	slogan: string | null;
	shortDescription: string | null;
}

/** One palette entry. `background` and `foreground` are operator-chosen hex. */
interface BrandColor {
	background: string;
	foreground: string;
}

interface BrandSocialLink {
	platform: string;
	url: string;
}

/**
 * The shop's brand row (GET/PUT /tour-operators/{id}/brand).
 *
 * The whole shape is modelled even though this release only edits the images,
 * slogan and short description: **PUT is a full replace** — `UpdateBrandUseCase`
 * rebuilds the row from the body and `readColors` yields an empty list when
 * `colors` is absent — so every write has to echo `colors` and `socialLinks`
 * back untouched or it silently wipes them.
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

/** The four image slots, and the only part of a brand this release writes. */
export type BrandImageSlot =
	| "logoMediaId"
	| "squareLogoMediaId"
	| "faviconMediaId"
	| "coverImageMediaId";

/**
 * The operator's own details (GET/PATCH /tour-operators/{id}).
 *
 * `handle` is READ-ONLY and absent from the PATCH input by design: it is the
 * storefront subdomain, so changing it would move the shop's public address and
 * break every link to it.
 */
export interface TourOperatorDetails {
	id: string;
	context: "tour-operators";
	name: string;
	handle: string;
	address: string;
	phone: string | null;
	email: string | null;
	timezoneId: string;
	currencyId: string;
	createdAt: string;
	updatedAt: string;
}
