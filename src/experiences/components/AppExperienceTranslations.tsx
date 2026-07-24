import { ArrowLeft, Languages } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppLink } from "#/shared/components/AppLink";
import { AppLocaleTabs } from "#/shared/components/AppLocaleTabs";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { localeLabel, useOperatorLocales } from "#/tour-operator";
import { useExperience } from "../hooks/use-experience";
import {
	useExperienceTranslation,
	useExperienceTranslations,
} from "../hooks/use-experience-translations";
import { AppExperienceTranslationForm } from "./AppExperienceTranslationForm";

// The experience translations editor: a locale switcher (supported languages
// minus the primary, which IS the canonical content) over a per-locale overlay
// form. Owns the canonical fetch + the active-locale state; the form seeds from
// the loaded overlay so it mounts only once that's in (keyed by locale to reseed
// on switch).
export const AppExperienceTranslations = ({
	tourOperatorId,
	experienceId,
}: {
	tourOperatorId: string;
	experienceId: string;
}) => {
	const experienceQuery = useExperience(tourOperatorId, experienceId);
	const localesQuery = useOperatorLocales(tourOperatorId);
	const listQuery = useExperienceTranslations(tourOperatorId, experienceId);

	const primary = localesQuery.data?.primaryLocale;
	const translatable = (localesQuery.data?.supportedLocales ?? []).filter(
		(code) => code !== primary,
	);
	const [picked, setPicked] = useState<string>();
	const active = picked ?? translatable[0];

	const translationQuery = useExperienceTranslation(
		tourOperatorId,
		experienceId,
		active,
	);
	const translated = new Set((listQuery.data ?? []).map((t) => t.locale));

	const backLink = (
		<AppLink
			to="/tour-operators/$tourOperatorId/experiences"
			params={{ tourOperatorId }}
			className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft className="size-4" />
			{m.back_to_experiences()}
		</AppLink>
	);

	return (
		<AppResourceView
			query={experienceQuery}
			resource={m.translations()}
			icon={Languages}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.catalog() }, { label: m.experiences() }]}
				/>
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
			{(experience) => (
				<>
					<AppPageHeader
						title={m.translations()}
						description={m.translations_description()}
						breadcrumb={
							<AppBreadcrumb
								items={[
									{ label: m.catalog() },
									{
										label: m.experiences(),
										to: "/tour-operators/$tourOperatorId/experiences",
										params: { tourOperatorId },
									},
									{
										label: experience.name,
										to: "/tour-operators/$tourOperatorId/experiences/$experienceId",
										params: { tourOperatorId, experienceId },
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
									{m.translations_no_languages()}
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
								<AppExperienceTranslationForm
									key={active}
									tourOperatorId={tourOperatorId}
									experienceId={experienceId}
									locale={active}
									canonical={experience}
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
