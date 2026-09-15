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
import { useExperience } from "../hooks/use-experience";
import {
	useExperienceTranslation,
	useExperienceTranslations,
} from "../hooks/use-experience-translations";
import type { ExperienceTranslation } from "../types";
import { AppExperienceTranslationForm } from "./AppExperienceTranslationForm";

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
	const metafieldLocales = useMetafieldTranslationLocales(
		tourOperatorId,
		"experience",
		experienceId,
	);
	const translated = new Set([
		...(listQuery.data ?? []).map((t) => t.locale),
		...(metafieldLocales.data ?? []),
	]);

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

					<AppQueryState query={localesQuery} loading={<AppLoadingBlock />}>
						{() =>
							translatable.length === 0 ? (
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
									{active && (
										<AppQueryState
											query={translationQuery}
											loading={<AppLoadingBlock />}
										>
											{(translation) =>
												canWrite ? (
													<AppExperienceTranslationForm
														key={active}
														tourOperatorId={tourOperatorId}
														experienceId={experienceId}
														locale={active}
														canonical={experience}
														translation={translation}
													/>
												) : (
													<AppTranslationSummary
														fields={experienceFields(translation)}
													/>
												)
											}
										</AppQueryState>
									)}
									{active && (
										<AppMetafieldTranslationsCard
											key={active}
											tourOperatorId={tourOperatorId}
											ownerType="experience"
											ownerId={experienceId}
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

const experienceFields = (t: ExperienceTranslation): TranslatedField[] => [
	[m.name(), t.name],
	[m.slug(), t.handle],
	[m.description(), t.description],
	[m.long_description(), t.longDescription],
];
