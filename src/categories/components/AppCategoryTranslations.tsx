import { AppFormSkeleton, AppPageHeader, AppResourceView } from "@vointika/ui";
import { Tags } from "lucide-react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { localeLabel, useOperatorLocales, usePermissions } from "#/session";
import { AppNameTranslations } from "#/shared/components/AppNameTranslations";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { useCategory } from "../hooks/use-category";

export const AppCategoryTranslations = ({
	tourOperatorId,
	categoryId,
}: {
	tourOperatorId: string;
	categoryId: string;
}) => {
	const { canWrite } = usePermissions();
	const query = useCategory(tourOperatorId, categoryId);
	const localesQuery = useOperatorLocales(tourOperatorId);
	const primary = localesQuery.data?.primaryLocale;
	const translatable = (localesQuery.data?.supportedLocales ?? []).filter(
		(code) => code !== primary,
	);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/categories"
			params={{ tourOperatorId }}
		>
			{m.back_to_categories()}
		</AppBackLink>
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
			notFoundAction={backLink}
			loading={<AppFormSkeleton rows={1} />}
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
