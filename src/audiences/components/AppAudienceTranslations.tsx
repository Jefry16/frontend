import { AppFormSkeleton, AppPageHeader, AppResourceView } from "@vointika/ui";
import { UsersRound } from "lucide-react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { localeLabel, useOperatorLocales, usePermissions } from "#/session";
import { AppNameTranslations } from "#/shared/components/AppNameTranslations";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { useAudience } from "../hooks/use-audience";

export const AppAudienceTranslations = ({
	tourOperatorId,
	audienceId,
}: {
	tourOperatorId: string;
	audienceId: string;
}) => {
	const { canWrite } = usePermissions();
	const query = useAudience(tourOperatorId, audienceId);
	const localesQuery = useOperatorLocales(tourOperatorId);
	const primary = localesQuery.data?.primaryLocale;
	const translatable = (localesQuery.data?.supportedLocales ?? []).filter(
		(code) => code !== primary,
	);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/audiences"
			params={{ tourOperatorId }}
		>
			{m.back_to_audiences()}
		</AppBackLink>
	);
	return (
		<AppResourceView
			query={query}
			resource={m.translations()}
			icon={UsersRound}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.catalog() }, { label: m.audiences() }]}
				/>
			}
			notFoundAction={backLink}
			loading={<AppFormSkeleton rows={1} />}
		>
			{(audience) => (
				<>
					<AppPageHeader
						title={m.translations()}
						description={m.name_translations_description()}
						breadcrumb={
							<AppBreadcrumb
								items={[
									{ label: m.catalog() },
									{
										label: m.audiences(),
										to: "/tour-operators/$tourOperatorId/audiences",
										params: { tourOperatorId },
									},
									{
										label: audience.name,
										to: "/tour-operators/$tourOperatorId/audiences/$audienceId",
										params: { tourOperatorId, audienceId },
									},
									{ label: m.translations() },
								]}
							/>
						}
					/>
					<AppNameTranslations
						tourOperatorId={tourOperatorId}
						endpointBase={`/tour-operators/${tourOperatorId}/audiences/${audienceId}/translations`}
						queryKeyBase={queryKeys.audienceTranslations(
							tourOperatorId,
							audienceId,
						)}
						canonicalName={audience.name}
						maxLength={80}
						translatable={translatable}
						localesQuery={localesQuery}
						localeLabel={localeLabel}
						canWrite={canWrite}
					/>
				</>
			)}
		</AppResourceView>
	);
};
