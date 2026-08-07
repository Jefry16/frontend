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
