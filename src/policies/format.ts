import * as m from "#/paraglide/messages";
import { POLICY_TYPES, type PolicyTypeCode } from "./types";

const LABELS: Record<PolicyTypeCode, () => string> = {
	CANCELLATION: m.policy_type_cancellation,
	PRIVACY: m.policy_type_privacy,
	TERMS: m.policy_type_terms,
	LEGAL_NOTICE: m.policy_type_legal_notice,
};

export const policyTypeLabel = (type: PolicyTypeCode): string => LABELS[type]();

export const POLICY_TYPE_OPTIONS = POLICY_TYPES.map((value) => ({
	value,
	label: policyTypeLabel(value),
}));

export const policySlug = (type: PolicyTypeCode): string =>
	type.toLowerCase().replaceAll("_", "-");
