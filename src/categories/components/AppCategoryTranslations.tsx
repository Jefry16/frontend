import { AppPageHeader, Card, CardContent, Skeleton } from "@vointika/ui";
import { Tags } from "lucide-react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { localeLabel, useOperatorLocales } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNameTranslations } from "#/shared/components/AppNameTranslations";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useCategory } from "../hooks/use-category";

export const AppCategoryTranslations = ({
	tourOperatorId,
	categoryId,
	canWrite,
}: {
	tourOperatorId: string;
	categoryId: string;
	canWrite: boolean;
}) => {
	const query = useCategory(tourOperatorId, categoryId);
	const localesQuery = useOperatorLocales(tourOperatorId);
	const primary = localesQuery.data?.primaryLocale;
	const translatable = (localesQuery.data?.supportedLocales ?? []).filter(
		(code) => code !== primary,
	);

	return (
		<AppResourceView
			query={query}
			resource={m.translations()}
			icon={Tags}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.catalog() }, { label: m.categories() }]}
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
			{(category) => (
				<>
					<AppPageHeader
						title={m.translations()}
						description={m.name_translations_description()}
						breadcrumb={
							<AppBreadcrumb
								items={[
									{ label: m.catalog() },
									{
										label: m.categories(),
										to: "/tour-operators/$tourOperatorId/categories",
										params: { tourOperatorId },
									},
									{
										label: category.name,
										to: "/tour-operators/$tourOperatorId/categories/$categoryId",
										params: { tourOperatorId, categoryId },
									},
									{ label: m.translations() },
								]}
							/>
						}
					/>
					<AppNameTranslations
						tourOperatorId={tourOperatorId}
						endpointBase={`/tour-operators/${tourOperatorId}/categories/${categoryId}/translations`}
						queryKeyBase={queryKeys.categoryTranslations(
							tourOperatorId,
							categoryId,
						)}
						canonicalName={category.name}
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
