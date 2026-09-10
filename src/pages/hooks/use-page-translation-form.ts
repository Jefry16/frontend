import { useTranslationOverlayForm } from "#/hooks/use-translation-overlay-form";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { PageTranslation } from "../types";
import {
	type PageTranslationFormData,
	pageTranslationSchema,
} from "../validators/page-translation";

export const usePageTranslationForm = ({
	tourOperatorId,
	pageId,
	locale,
	translation,
}: {
	tourOperatorId: string;
	pageId: string;
	locale: string;
	translation: PageTranslation;
}) =>
	useTranslationOverlayForm({
		endpoint: `/tour-operators/${tourOperatorId}/pages/${pageId}/translations/${locale}`,
		schema: pageTranslationSchema,
		defaultValues: {
			title: translation.title ?? "",
			body: translation.body ?? "",
			seoTitle: translation.seoTitle ?? "",
			seoDescription: translation.seoDescription ?? "",
			handle: translation.handle ?? "",
		} as PageTranslationFormData,
		invalidateKeys: [
			queryKeys.activity(tourOperatorId),
			queryKeys.pageTranslations(tourOperatorId, pageId),
			queryKeys.pageTranslation(tourOperatorId, pageId, locale),
		],
		conflictMessage: m.slug_taken(),
	});
