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

/**
 * One policy. List and detail return the SAME shape — the backend maps both
 * through PolicyResponse — so there is no thinner list row to model. Verified
 * against the running API rather than assumed from the two endpoints existing.
 */
export interface Policy {
	id: string;
	context: "policies";
	type: PolicyTypeCode;
	title: string;
	/** Raw operator-authored HTML; the storefront renders it unescaped. */
	body: string;
	createdAt: string;
	updatedAt: string;
}

/** One locale's overlay. A null field falls back to the canonical policy. */
export interface PolicyTranslation {
	locale: string;
	title: string | null;
	body: string | null;
}
