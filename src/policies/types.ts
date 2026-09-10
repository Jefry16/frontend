export const POLICY_TYPES = [
	"CANCELLATION",
	"PRIVACY",
	"TERMS",
	"LEGAL_NOTICE",
] as const;

export type PolicyTypeCode = (typeof POLICY_TYPES)[number];

export interface Policy {
	id: string;
	context: "policies";
	type: PolicyTypeCode;
	title: string;
	body: string;
	createdAt: string;
	updatedAt: string;
}

export interface PolicyTranslation {
	locale: string;
	title: string | null;
	body: string | null;
}
