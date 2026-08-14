import { type ReactNode, useState } from "react";
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

// The primary locale is absent from the strip on purpose: it IS the canonical
// text, so there is nothing to overlay onto it.
//
// Reads are member-visible and writes are ADMIN+, so a staff member gets the
// content read-only rather than a form that 403s on save.
//
// The last two props exist because this module cannot reach `metafields`:
// `metafields` imports `#/tour-operator`, so importing it back is a cycle
// (verified — 6 `no-circular` errors). The page and experience editors, which
// are not on that arc, render the metafield overlay inline. Here the route
// composes it instead, and passes back the locales it covers so the tab dots
// mean the same thing on all three screens.
export const AppOperatorTranslations = ({
	tourOperatorId,
	canWrite,
	alsoTranslated = [],
	perLocale,
}: {
	tourOperatorId: string;
	canWrite: boolean;
	/** Locales a caller-rendered section translates, unioned into the tab dots. */
	alsoTranslated?: readonly string[];
	/** Rendered under the form for the active locale. */
	perLocale?: (locale: string) => ReactNode;
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
	const translated = new Set([
		...(listQuery.data ?? []).map((t) => t.locale),
		...alsoTranslated,
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
			{active && perLocale?.(active)}
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
