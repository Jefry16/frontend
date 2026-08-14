import { useTranslationOverlayForm } from "#/hooks/use-translation-overlay-form";
import { queryKeys } from "#/lib/query-keys";
import type { OperatorTranslation } from "../types";
import {
	type OperatorTranslationFormData,
	operatorTranslationSchema,
} from "../validators/operator-translation";

export const useOperatorTranslationForm = ({
	tourOperatorId,
	locale,
	translation,
}: {
	tourOperatorId: string;
	locale: string;
	translation: OperatorTranslation;
}) =>
	useTranslationOverlayForm({
		endpoint: `/tour-operators/${tourOperatorId}/translations/${locale}`,
		schema: operatorTranslationSchema,
		defaultValues: {
			slogan: translation.slogan ?? "",
			shortDescription: translation.shortDescription ?? "",
			seoTitle: translation.seoTitle ?? "",
			seoDescription: translation.seoDescription ?? "",
			passwordMessage: translation.passwordMessage ?? "",
		} as OperatorTranslationFormData,
		invalidateKeys: [
			queryKeys.activity(tourOperatorId),
			queryKeys.operatorTranslations(tourOperatorId),
			queryKeys.operatorTranslation(tourOperatorId, locale),
		],
	});
