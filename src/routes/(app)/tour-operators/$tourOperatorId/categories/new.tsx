import { createFileRoute } from "@tanstack/react-router";
import { AppCategoryForm } from "#/categories";
import * as m from "#/paraglide/messages";
import { AppWriteGate } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/categories/new",
)({
	component: NewCategoryPage,
});

// Static "new" wins over the dynamic $categoryId sibling.
function NewCategoryPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppPageHeader
				title={m.new_category()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.catalog() },
							{
								label: m.categories(),
								to: "/tour-operators/$tourOperatorId/categories",
								params: { tourOperatorId },
							},
							{ label: m.new_category() },
						]}
					/>
				}
			/>
			<AppWriteGate>
				<AppCategoryForm tourOperatorId={tourOperatorId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
