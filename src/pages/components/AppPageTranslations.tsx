import {
	AppFormSkeleton,
	AppLoadingBlock,
	AppLocaleTabs,
	AppPageHeader,
	AppQueryState,
	AppResourceView,
	AppTranslationSummary,
	Skeleton,
	type TranslatedField,
} from "@vointika/ui";
import { Languages } from "lucide-react";
import { useState } from "react";
import {
	AppMetafieldTranslationsCard,
	useMetafieldTranslationLocales,
} from "#/metafields";
import * as m from "#/paraglide/messages";
import { localeLabel, useOperatorLocales } from "#/session";
import { AppNoTranslatableLocales } from "#/shared/components/AppNoTranslatableLocales";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { usePage } from "../hooks/use-page";
import {
	usePageTranslation,
	usePageTranslations,
} from "../hooks/use-page-translations";
import type { PageTranslation } from "../types";
import { AppPageTranslationForm } from "./AppPageTranslationForm";

export const AppPageTranslations = ({
	tourOperatorId,
	pageId,
	canWrite,
}: {
	tourOperatorId: string;
	pageId: string;
	canWrite: boolean;
}) => {
	const pageQuery = usePage(tourOperatorId, pageId);
	const localesQuery = useOperatorLocales(tourOperatorId);
	const listQuery = usePageTranslations(tourOperatorId, pageId);

	const primary = localesQuery.data?.primaryLocale;
	const translatable = (localesQuery.data?.supportedLocales ?? []).filter(
		(code) => code !== primary,
	);
	const [picked, setPicked] = useState<string>();
	const active = picked ?? translatable[0];

	const translationQuery = usePageTranslation(tourOperatorId, pageId, active);
	const metafieldLocales = useMetafieldTranslationLocales(
		tourOperatorId,
		"page",
		pageId,
	);
	const translated = new Set([
		...(listQuery.data ?? []).map((t) => t.locale),
		...(metafieldLocales.data ?? []),
	]);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/content/pages"
			params={{ tourOperatorId }}
		>
			{m.back_to_pages()}
		</AppBackLink>
	);

	return (
		<AppResourceView
			query={pageQuery}
			resource={m.translations()}
			icon={Languages}
			breadcrumb={
				<AppBreadcrumb items={[{ label: m.content() }, { label: m.pages() }]} />
			}
			notFoundAction={backLink}
			loading={
				<div className="flex flex-col gap-4">
					<Skeleton className="h-9 w-64" />
					<AppFormSkeleton rows={3} />
				</div>
			}
		>
			{(page) => (
				<>
					<AppPageHeader
						title={m.translations()}
						description={m.name_translations_description()}
						breadcrumb={
							<AppBreadcrumb
								items={[
									{ label: m.content() },
									{
										label: m.pages(),
										to: "/tour-operators/$tourOperatorId/content/pages",
										params: { tourOperatorId },
									},
									{
										label: page.title,
										to: "/tour-operators/$tourOperatorId/content/pages/$pageId",
										params: { tourOperatorId, pageId },
									},
									{ label: m.translations() },
								]}
							/>
						}
					/>

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
										label={(code) => localeLabel(code)}
									/>
									{active && (
										<AppQueryState
											query={translationQuery}
											loading={<AppLoadingBlock />}
										>
											{(translation) =>
												canWrite ? (
													<AppPageTranslationForm
														key={active}
														tourOperatorId={tourOperatorId}
														pageId={pageId}
														locale={active}
														canonical={page}
														translation={translation}
													/>
												) : (
													<AppTranslationSummary
														fields={pageFields(translation)}
													/>
												)
											}
										</AppQueryState>
									)}
									{active && (
										<AppMetafieldTranslationsCard
											key={active}
											tourOperatorId={tourOperatorId}
											ownerType="page"
											ownerId={pageId}
											locale={active}
											canWrite={canWrite}
										/>
									)}
								</div>
							)
						}
					</AppQueryState>
				</>
			)}
		</AppResourceView>
	);
};

const pageFields = (t: PageTranslation): TranslatedField[] => [
	[m.title(), t.title],
	[m.page_body(), t.body],
	[m.seo_title(), t.seoTitle],
	[m.seo_description(), t.seoDescription],
	[m.handle(), t.handle],
];
