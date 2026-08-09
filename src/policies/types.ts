// One policy per type: the type IS the storefront address, so it is chosen at
// create and immutable after.

/** The enum name goes on the wire verbatim. */
export const POLICY_TYPES = [
	"CANCELLATION",
	"PRIVACY",
	"TERMS",
	"LEGAL_NOTICE",
] as const;

export type PolicyTypeCode = (typeof POLICY_TYPES)[number];

// List and detail return the SAME shape, verified against the running API — so
// there is no thinner list row to model.
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
