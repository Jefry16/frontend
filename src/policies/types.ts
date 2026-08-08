// Store policies: the operator's legal documents (cancellation, privacy, terms,
// legal notice), rendered by the storefront at /policies/{slug}. One per type —
// the type is the address, so it is chosen at create and immutable after.

/** The closed set the backend's PolicyType enum carries. The body sends the enum name. */
export const POLICY_TYPES = [
	"CANCELLATION",
	"PRIVACY",
	"TERMS",
	"LEGAL_NOTICE",
] as const;

export type PolicyTypeCode = (typeof POLICY_TYPES)[number];

export interface PolicyListItem {
	id: string;
	context: "policies";
	type: PolicyTypeCode;
	title: string;
	createdAt: string;
	updatedAt: string;
}

/** The detail read — the list row plus the raw-HTML body. */
export interface Policy extends PolicyListItem {
	body: string;
}

/** One locale's overlay. A null field falls back to the canonical policy. */
export interface PolicyTranslation {
	locale: string;
	title: string | null;
	body: string | null;
}
