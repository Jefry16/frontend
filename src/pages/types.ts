// GET /tour-operators/{id}/pages — CMS content pages. The list rows exclude
// `body` (heavy HTML stays on the detail read); the detail carries everything.

export type PageStatus = "DRAFT" | "PUBLISHED";

/** A list row (no body/SEO/template — those live on the detail). */
export interface PageListItem {
	id: string;
	context: "pages";
	title: string;
	handle: string;
	status: PageStatus;
	createdAt: string;
	updatedAt: string;
}

export interface Page {
	id: string;
	context: "pages";
	title: string;
	handle: string;
	/** Operator-authored raw HTML, stored verbatim. */
	body: string;
	seoTitle: string | null;
	seoDescription: string | null;
	status: PageStatus;
	templateSuffix: string | null;
	createdAt: string;
	updatedAt: string;
}

// One locale's overlay; every field nullable (null = untranslated, falls back
// to canonical). `handle` = the localized handle (null = canonical serves it).
export interface PageTranslation {
	locale: string;
	title: string | null;
	body: string | null;
	seoTitle: string | null;
	seoDescription: string | null;
	handle: string | null;
}
