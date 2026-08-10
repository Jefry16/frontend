import { Languages } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "#/components/ui/skeleton";
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
import { useExperience } from "../hooks/use-experience";
import {
	useExperienceTranslation,
	useExperienceTranslations,
} from "../hooks/use-experience-translations";
import type { ExperienceTranslation } from "../types";
import { AppExperienceTranslationForm } from "./AppExperienceTranslationForm";

// The experience translations editor: a locale switcher (supported languages
// minus the primary, which IS the canonical content) over a per-locale overlay
// form. Owns the canonical fetch + the active-locale state; the form seeds from
// the loaded overlay so it mounts only once that's in (keyed by locale to reseed
// on switch).
export const AppExperienceTranslations = ({
	tourOperatorId,
	experienceId,
	canWrite,
}: {
	tourOperatorId: string;
	experienceId: string;
	canWrite: boolean;
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
		<AppBackLink
			to="/tour-operators/$tourOperatorId/experiences"
			params={{ tourOperatorId }}
		>
			{m.back_to_experiences()}
		</AppBackLink>
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
					<AppFormSkeleton rows={3} />
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
						<AppLoadingBlock />
					) : translatable.length === 0 ? (
						<AppNoTranslatableLocales
							tourOperatorId={tourOperatorId}
							message={m.translations_no_languages()}
						/>
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
									<AppExperienceTranslationForm
										key={active}
										tourOperatorId={tourOperatorId}
										experienceId={experienceId}
										locale={active}
										canonical={experience}
										translation={translationQuery.data}
									/>
								) : (
									<AppTranslationSummary
										fields={experienceFields(translationQuery.data)}
									/>
								)
							) : (
								<AppLoadingBlock />
							)}
						</div>
					)}
				</>
			)}
		</AppResourceView>
	);
};

// This resource's rows for AppTranslationSummary.
const experienceFields = (t: ExperienceTranslation): TranslatedField[] => [
	[m.name(), t.name],
	[m.slug(), t.handle],
	[m.description(), t.description],
	[m.long_description(), t.longDescription],
];
