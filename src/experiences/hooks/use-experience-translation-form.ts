import { useTranslationOverlayForm } from "#/hooks/use-translation-overlay-form";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { ExperienceTranslation } from "../types";
import {
	type ExperienceTranslationFormData,
	experienceTranslationSchema,
} from "../validators/experience-translation";

export const useExperienceTranslationForm = ({
	tourOperatorId,
	experienceId,
	locale,
	translation,
}: {
	tourOperatorId: string;
	experienceId: string;
	locale: string;
	translation: ExperienceTranslation;
}) =>
	useTranslationOverlayForm({
		endpoint: `/tour-operators/${tourOperatorId}/experiences/${experienceId}/translations/${locale}`,
		schema: experienceTranslationSchema,
		defaultValues: {
			name: translation.name ?? "",
			description: translation.description ?? "",
			longDescription: translation.longDescription ?? "",
			handle: translation.handle ?? "",
			seoTitle: translation.seoTitle ?? "",
			seoDescription: translation.seoDescription ?? "",
		} as ExperienceTranslationFormData,
		invalidateKeys: [
			queryKeys.activity(tourOperatorId),
			queryKeys.experienceTranslations(tourOperatorId, experienceId),
			queryKeys.experienceTranslation(tourOperatorId, experienceId, locale),
		],
		// A 409 here is a localized-slug collision (per operator + locale).
		conflictMessage: m.slug_taken(),
	});
