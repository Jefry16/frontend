import {
	AppEmptyState,
	AppFormSkeleton,
	AppLoadingBlock,
	AppLocaleTabs,
	AppPageHeader,
	AppQueryState,
	AppResourceView,
	AppTranslationSummary,
} from "@vointika/ui";
import { Languages } from "lucide-react";
import { useState } from "react";
import * as m from "#/paraglide/messages";
import { localeLabel, useOperatorLocales, usePermissions } from "#/session";
import { AppNoTranslatableLocales } from "#/shared/components/AppNoTranslatableLocales";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { useMetaobject } from "../hooks/use-metaobject";
import {
	useMetaobjectTranslation,
	useMetaobjectTranslationLocales,
} from "../hooks/use-metaobject-translations";
import { translatableFields } from "../validators/metaobject-translation";
import { AppMetaobjectTranslationForm } from "./AppMetaobjectTranslationForm";

export const AppMetaobjectTranslations = ({
	tourOperatorId,
	metaobjectId,
}: {
	tourOperatorId: string;
	metaobjectId: string;
}) => {
	const { canWrite } = usePermissions();
	const entryQuery = useMetaobject(tourOperatorId, metaobjectId);
	const localesQuery = useOperatorLocales(tourOperatorId);
	const listQuery = useMetaobjectTranslationLocales(
		tourOperatorId,
		metaobjectId,
	);

	const primary = localesQuery.data?.primaryLocale;
	const translatable = (localesQuery.data?.supportedLocales ?? []).filter(
		(code) => code !== primary,
	);
	const [picked, setPicked] = useState<string>();
	const active = picked ?? translatable[0];

	const translationQuery = useMetaobjectTranslation(
		tourOperatorId,
		metaobjectId,
		active,
	);
	const translated = new Set(listQuery.data ?? []);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/content/metaobjects"
			params={{ tourOperatorId }}
		>
			{m.back_to_metaobjects()}
		</AppBackLink>
	);

	return (
		<AppResourceView
			query={entryQuery}
			resource={m.translations()}
			icon={Languages}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.content() }, { label: m.metaobjects() }]}
				/>
			}
			notFoundAction={backLink}
			loading={<AppFormSkeleton rows={3} />}
		>
			{(entry) => {
				const fields = translatableFields(entry);
				return (
					<>
						<AppPageHeader
							title={m.translations()}
							description={m.translations_description()}
							breadcrumb={
								<AppBreadcrumb
									items={[
										{ label: m.content() },
										{
											label: m.metaobjects(),
											to: "/tour-operators/$tourOperatorId/content/metaobjects",
											params: { tourOperatorId },
										},
										{
											label: entry.name,
											to: "/tour-operators/$tourOperatorId/content/metaobjects/entries/$metaobjectId",
											params: { tourOperatorId, metaobjectId },
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
								) : fields.length === 0 ? (
									<AppEmptyState
										icon={Languages}
										title={m.metaobject_no_translatable_fields()}
										description={m.metaobject_no_translatable_fields_body()}
									/>
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
														<AppMetaobjectTranslationForm
															key={active}
															tourOperatorId={tourOperatorId}
															metaobjectId={metaobjectId}
															locale={active}
															fields={fields}
															translation={translation}
														/>
													) : (
														<AppTranslationSummary
															fields={fields.map((field) => [
																field.name,
																translation[field.key] ?? null,
															])}
														/>
													)
												}
											</AppQueryState>
										)}
									</div>
								)
							}
						</AppQueryState>
					</>
				);
			}}
		</AppResourceView>
	);
};
