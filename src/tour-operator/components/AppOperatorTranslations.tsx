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

// The primary locale is absent from the strip on purpose: it IS the canonical
// text, so there is nothing to overlay onto it.
//
// Reads are member-visible and writes are ADMIN+, so a staff member gets the
// content read-only rather than a form that 403s on save.
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
	// The operator is its own metafield owner, so it is its own ownerId.
	const metafieldLocales = useMetafieldTranslationLocales(
		tourOperatorId,
		"tour_operator",
		tourOperatorId,
	);
	// A locale translated only in its metafields is still translated — the dot
	// reads "has anything for this locale", not "has canonical fields".
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

// The same five fields the form edits, in the same order.
const operatorFields = (t: OperatorTranslation): TranslatedField[] => [
	[m.slogan(), t.slogan],
	[m.short_description(), t.shortDescription],
	[m.seo_title(), t.seoTitle],
	[m.seo_description(), t.seoDescription],
	[m.visitor_message(), t.passwordMessage],
];
