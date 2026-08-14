import { UsersRound } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { localeLabel, useOperatorLocales } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNameTranslations } from "#/shared/components/AppNameTranslations";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useAudience } from "../hooks/use-audience";

// The audience translations editor: the shared single-name editor bound to this
// audience's endpoints (name ≤80, mirroring the backend AudienceName).
export const AppAudienceTranslations = ({
	tourOperatorId,
	audienceId,
	canWrite,
}: {
	tourOperatorId: string;
	audienceId: string;
	canWrite: boolean;
}) => {
	const query = useAudience(tourOperatorId, audienceId);
	const localesQuery = useOperatorLocales(tourOperatorId);
	const primary = localesQuery.data?.primaryLocale;
	const translatable = (localesQuery.data?.supportedLocales ?? []).filter(
		(code) => code !== primary,
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
			loading={
				<Card>
					<CardContent className="flex flex-col gap-4">
						<Skeleton className="h-9 w-64" />
						<Skeleton className="h-9 w-full" />
					</CardContent>
				</Card>
			}
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
						localesPending={localesQuery.isPending}
						localeLabel={localeLabel}
						canWrite={canWrite}
					/>
				</>
			)}
		</AppResourceView>
	);
};
