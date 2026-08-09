import { useState } from "react";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppLoadingBlock } from "#/shared/components/AppLoadingBlock";
import { AppLocaleTabs } from "#/shared/components/AppLocaleTabs";
import { AppNoTranslatableLocales } from "#/shared/components/AppNoTranslatableLocales";
import {
	AppTranslationSummary,
	type TranslatedField,
} from "#/shared/components/AppTranslationSummary";
import { useOperatorLocales } from "../hooks/use-operator-locales";
import {
	useOperatorTranslation,
	useOperatorTranslations,
} from "../hooks/use-operator-translations";
import { localeLabel } from "../locales";
import type { OperatorTranslation } from "../types";
import { AppOperatorTranslationForm } from "./AppOperatorTranslationForm";

// Settings → Translations: the shop's own text per locale — the page-level
// translation editor's shell (a locale switcher over a per-locale overlay form,
// keyed by locale so it reseeds on switch), but for the operator itself rather
// than one resource.
//
// The primary locale is absent from the strip on purpose: it IS the canonical
// text, so there is nothing to overlay onto it.
//
// Reads are member-visible while writes are ADMIN+, so `canWrite` decides
// between the form and a read-only summary — a staff member gets the content
// rather than a form that 403s on save, the same split the Languages section makes.
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
	const translated = new Set((listQuery.data ?? []).map((t) => t.locale));

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
		</div>
	);
};

// This resource's rows for AppTranslationSummary — the same five fields the
// form edits, in the same order.
const operatorFields = (t: OperatorTranslation): TranslatedField[] => [
	[m.slogan(), t.slogan],
	[m.short_description(), t.shortDescription],
	[m.seo_title(), t.seoTitle],
	[m.seo_description(), t.seoDescription],
	[m.visitor_message(), t.passwordMessage],
];
