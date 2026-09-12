import { AppFormSkeleton, AppPageHeader } from "@vointika/ui";
import { Tags } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppResourceView } from "#/shared/components/AppResourceView";
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
