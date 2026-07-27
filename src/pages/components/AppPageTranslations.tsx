import { Languages } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppLink } from "#/shared/components/AppLink";
import { AppLocaleTabs } from "#/shared/components/AppLocaleTabs";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { localeLabel, useOperatorLocales } from "#/tour-operator";
import { usePage } from "../hooks/use-page";
import {
	usePageTranslation,
	usePageTranslations,
} from "../hooks/use-page-translations";
import { AppPageTranslationForm } from "./AppPageTranslationForm";

// The page translations editor — the experience-translations shell: a locale
// switcher (supported minus the primary, which IS the canonical content) over
// a per-locale overlay form, keyed by locale so it reseeds on switch.
export const AppPageTranslations = ({
	tourOperatorId,
	pageId,
}: {
	tourOperatorId: string;
	pageId: string;
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
	const translated = new Set((listQuery.data ?? []).map((t) => t.locale));

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
					<Card>
						<CardContent className="flex flex-col gap-4">
							{["a", "b", "c"].map((k) => (
								<Skeleton key={k} className="h-9 w-full" />
							))}
						</CardContent>
					</Card>
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
						<div className="flex justify-center py-10">
							<Spinner />
						</div>
					) : translatable.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center gap-2 py-10 text-center">
								<Languages className="size-8 text-muted-foreground" />
								<p className="text-sm text-muted-foreground">
									{m.translations_no_languages_generic()}
								</p>
								<AppLink
									to="/tour-operators/$tourOperatorId/settings/languages"
									params={{ tourOperatorId }}
									className="text-sm font-medium text-primary hover:underline"
								>
									{m.manage_languages()}
								</AppLink>
							</CardContent>
						</Card>
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
								<AppPageTranslationForm
									key={active}
									tourOperatorId={tourOperatorId}
									pageId={pageId}
									locale={active}
									canonical={page}
									translation={translationQuery.data}
								/>
							) : (
								<div className="flex justify-center py-10">
									<Spinner />
								</div>
							)}
						</div>
					)}
				</>
			)}
		</AppResourceView>
	);
};
