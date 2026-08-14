import { useTranslationOverlayForm } from "#/hooks/use-translation-overlay-form";
import { queryKeys } from "#/lib/query-keys";
import type { PolicyTranslation } from "../types";
import {
	type PolicyTranslationFormData,
	policyTranslationSchema,
} from "../validators/policy-translation";

// Both fields fall back to the canonical policy when cleared.
export const usePolicyTranslationForm = ({
	tourOperatorId,
	policyId,
	locale,
	translation,
}: {
	tourOperatorId: string;
	policyId: string;
	locale: string;
	translation: PolicyTranslation;
}) =>
	useTranslationOverlayForm({
		endpoint: `/tour-operators/${tourOperatorId}/policies/${policyId}/translations/${locale}`,
		schema: policyTranslationSchema,
		defaultValues: {
			title: translation.title ?? "",
			body: translation.body ?? "",
		} as PolicyTranslationFormData,
		invalidateKeys: [
			queryKeys.policyTranslations(tourOperatorId, policyId),
			queryKeys.activity(tourOperatorId),
		],
	});
