import { AppFormSkeleton, AppPageHeader, AppResourceView } from "@vointika/ui";
import { Tags } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { useCategory } from "../hooks/use-category";
import { AppCategoryForm } from "./AppCategoryForm";

export const AppCategoryEdit = ({
	tourOperatorId,
	categoryId,
}: {
	tourOperatorId: string;
	categoryId: string;
}) => {
	const query = useCategory(tourOperatorId, categoryId);

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
			resource={m.category()}
			icon={Tags}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.catalog() }, { label: m.categories() }]}
				/>
			}
			notFoundAction={backLink}
			loading={<AppFormSkeleton rows={2} />}
		>
			{(category) => (
				<>
					<AppPageHeader
						title={m.edit_category()}
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
									{ label: m.edit() },
								]}
							/>
						}
					/>
					<AppCategoryForm
						tourOperatorId={tourOperatorId}
						category={category}
					/>
				</>
			)}
		</AppResourceView>
	);
};
