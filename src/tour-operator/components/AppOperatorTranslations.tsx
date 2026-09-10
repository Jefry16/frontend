import { useState } from "react";
import {
	AppMetafieldTranslationsCard,
	useMetafieldTranslationLocales,
} from "#/metafields";
import * as m from "#/paraglide/messages";
import { localeLabel, useOperatorLocales } from "#/session";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppLoadingBlock } from "#/shared/components/AppLoadingBlock";
import { AppLocaleTabs } from "#/shared/components/AppLocaleTabs";
import { AppNoTranslatableLocales } from "#/shared/components/AppNoTranslatableLocales";
import {
	AppTranslationSummary,
	type TranslatedField,
} from "#/shared/components/AppTranslationSummary";
import {
	useOperatorTranslation,
	useOperatorTranslations,
} from "../hooks/use-operator-translations";
import type { OperatorTranslation } from "../types";
import { AppOperatorTranslationForm } from "./AppOperatorTranslationForm";

export const AppOperatorTranslations = ({
	tourOperatorId,
	canWrite,
}: {
	tourOperatorId: string;
	canWrite: boolean;
}) => {
	const localesQuery = useOperatorLocales(tourOperatorId);
	const listQuery = useOperatorTranslations(tourOperatorId);

	const primary = localesQuery.data?.primaryLocale;
	const translatable = (localesQuery.data?.supportedLocales ?? []).filter(
		(code) => code !== primary,
	);
	const [picked, setPicked] = useState<string>();
	const active = picked ?? translatable[0];

	const translationQuery = useOperatorTranslation(tourOperatorId, active);
	const metafieldLocales = useMetafieldTranslationLocales(
		tourOperatorId,
		"tour_operator",
		tourOperatorId,
	);
	const translated = new Set([
		...(listQuery.data ?? []).map((t) => t.locale),
		...(metafieldLocales.data ?? []),
	]);

	if (localesQuery.isPending) {
		return <AppLoadingBlock />;
	}

	if (localesQuery.isError) {
		return <AppAlert title={m.error()} description={m.error()} />;
	}

	if (translatable.length === 0) {
		return <AppNoTranslatableLocales tourOperatorId={tourOperatorId} />;
	}

	return (
		<div className="flex flex-col gap-4">
			<AppLocaleTabs
				locales={translatable}
				active={active}
				onSelect={setPicked}
				translated={translated}
				label={(code) => localeLabel(code)}
			/>
			{active && translationQuery.data ? (
				canWrite ? (
					<AppOperatorTranslationForm
						key={active}
						tourOperatorId={tourOperatorId}
						locale={active}
						translation={translationQuery.data}
					/>
				) : (
					<AppTranslationSummary
						fields={operatorFields(translationQuery.data)}
					/>
				)
			) : (
				<AppLoadingBlock />
			)}
			{active && (
				<AppMetafieldTranslationsCard
					key={active}
					tourOperatorId={tourOperatorId}
					ownerType="tour_operator"
					ownerId={tourOperatorId}
					locale={active}
					canWrite={canWrite}
				/>
			)}
		</div>
	);
};

const operatorFields = (t: OperatorTranslation): TranslatedField[] => [
	[m.slogan(), t.slogan],
	[m.short_description(), t.shortDescription],
	[m.seo_title(), t.seoTitle],
	[m.seo_description(), t.seoDescription],
	[m.visitor_message(), t.passwordMessage],
];
