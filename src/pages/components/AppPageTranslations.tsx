import { Languages } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "#/components/ui/skeleton";
import {
	AppMetafieldTranslationsCard,
	useMetafieldTranslationLocales,
} from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppFormSkeleton } from "#/shared/components/AppFormSkeleton";
import { AppLoadingBlock } from "#/shared/components/AppLoadingBlock";
import { AppLocaleTabs } from "#/shared/components/AppLocaleTabs";
import { AppNoTranslatableLocales } from "#/shared/components/AppNoTranslatableLocales";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import {
	AppTranslationSummary,
	type TranslatedField,
} from "#/shared/components/AppTranslationSummary";
import { localeLabel, useOperatorLocales } from "#/tour-operator";
import { usePage } from "../hooks/use-page";
import {
	usePageTranslation,
	usePageTranslations,
} from "../hooks/use-page-translations";
import type { PageTranslation } from "../types";
import { AppPageTranslationForm } from "./AppPageTranslationForm";

// The page translations editor — the experience-translations shell: a locale
// switcher (supported minus the primary, which IS the canonical content) over
// a per-locale overlay form, keyed by locale so it reseeds on switch.
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
	// A locale translated only in its metafields is still translated — the dot
	// reads "has anything for this locale", not "has canonical fields".
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

					{localesQuery.isPending ? (
						<AppLoadingBlock />
					) : translatable.length === 0 ? (
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
							{active && translationQuery.data ? (
								canWrite ? (
									<AppPageTranslationForm
										key={active}
										tourOperatorId={tourOperatorId}
										pageId={pageId}
										locale={active}
										canonical={page}
										translation={translationQuery.data}
									/>
								) : (
									<AppTranslationSummary
										fields={pageFields(translationQuery.data)}
									/>
								)
							) : (
								<AppLoadingBlock />
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
					)}
				</>
			)}
		</AppResourceView>
	);
};

// This resource's rows for AppTranslationSummary — the fields the form edits.
const pageFields = (t: PageTranslation): TranslatedField[] => [
	[m.title(), t.title],
	[m.page_body(), t.body],
	[m.seo_title(), t.seoTitle],
	[m.seo_description(), t.seoDescription],
	[m.handle(), t.handle],
];
