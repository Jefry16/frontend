import { createFileRoute } from "@tanstack/react-router";
import { AppCategoriesList } from "#/categories";
import * as m from "#/paraglide/messages";
import { usePermissions } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/categories/",
)({
	component: CategoriesPage,
});

// How experiences are grouped on the storefront.
function CategoriesPage() {
	const { tourOperatorId } = Route.useParams();
	const { canWrite } = usePermissions();

	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.categories()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.catalog() }, { label: m.categories() }]}
					/>
				}
				actions={
					canWrite && (
						<AppNewLink
							to="/tour-operators/$tourOperatorId/categories/new"
							params={{ tourOperatorId }}
						>
							{m.new_category()}
						</AppNewLink>
					)
				}
			/>
			<AppCategoriesList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
