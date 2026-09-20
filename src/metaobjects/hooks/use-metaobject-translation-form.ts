import { useTranslationOverlayForm } from "#/hooks/use-translation-overlay-form";
import { queryKeys } from "#/lib/query-keys";
import {
	metaobjectTranslationSchema,
	type TranslatableField,
} from "../validators/metaobject-translation";

export const useMetaobjectTranslationForm = ({
	tourOperatorId,
	metaobjectId,
	locale,
	fields,
	translation,
}: {
	tourOperatorId: string;
	metaobjectId: string;
	locale: string;
	fields: TranslatableField[];
	translation: Record<string, string>;
}) =>
	useTranslationOverlayForm({
		endpoint: `/tour-operators/${tourOperatorId}/metaobjects/${metaobjectId}/field-translations/${locale}`,
		schema: metaobjectTranslationSchema(fields),
		defaultValues: Object.fromEntries(
			fields.map((field) => [field.key, translation[field.key] ?? ""]),
		) as Record<string, string>,
		invalidateKeys: [
			queryKeys.activity(tourOperatorId),
			queryKeys.metaobjectTranslations(tourOperatorId, metaobjectId),
			queryKeys.metaobjectTranslation(tourOperatorId, metaobjectId, locale),
		],
	});
