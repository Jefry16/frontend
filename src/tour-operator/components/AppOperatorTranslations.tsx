import {
	AppLoadingBlock,
	AppLocaleTabs,
	AppQueryState,
	AppTranslationSummary,
	type TranslatedField,
} from "@vointika/ui";
import { useState } from "react";
import {
	AppMetafieldTranslationsCard,
	useMetafieldTranslationLocales,
} from "#/metafields";
import * as m from "#/paraglide/messages";
import { localeLabel, useOperatorLocales, usePermissions } from "#/session";
import { AppNoTranslatableLocales } from "#/shared/components/AppNoTranslatableLocales";
import {
	useOperatorTranslation,
	useOperatorTranslations,
} from "../hooks/use-operator-translations";
import type { OperatorTranslation } from "../types";
import { AppOperatorTranslationForm } from "./AppOperatorTranslationForm";

export const AppOperatorTranslations = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { canWrite } = usePermissions();
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

	return (
		<AppQueryState query={localesQuery} loading={<AppLoadingBlock />}>
			{() =>
				translatable.length === 0 ? (
					<AppNoTranslatableLocales tourOperatorId={tourOperatorId} />
				) : (
					<div className="flex flex-col gap-4">
						<AppLocaleTabs
							locales={translatable}
							active={active}
							onSelect={setPicked}
							translated={translated}
							label={localeLabel}
						/>
						{active && (
							<AppQueryState
								query={translationQuery}
								loading={<AppLoadingBlock />}
							>
								{(translation) =>
									canWrite ? (
										<AppOperatorTranslationForm
											key={active}
											tourOperatorId={tourOperatorId}
											locale={active}
											translation={translation}
										/>
									) : (
										<AppTranslationSummary
											fields={operatorFields(translation)}
										/>
									)
								}
							</AppQueryState>
						)}
						{active && (
							<AppMetafieldTranslationsCard
								key={active}
								tourOperatorId={tourOperatorId}
								ownerType="tour_operator"
								ownerId={tourOperatorId}
								locale={active}
							/>
						)}
					</div>
				)
			}
		</AppQueryState>
	);
};

const operatorFields = (t: OperatorTranslation): TranslatedField[] => [
	[m.slogan(), t.slogan],
	[m.short_description(), t.shortDescription],
	[m.seo_title(), t.seoTitle],
	[m.seo_description(), t.seoDescription],
	[m.visitor_message(), t.passwordMessage],
];
