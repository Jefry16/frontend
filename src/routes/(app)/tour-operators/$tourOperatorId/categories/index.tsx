import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppCategoriesList } from "#/categories";
import * as m from "#/paraglide/messages";
import { usePermissions } from "#/session";
import { AppBreadcrumb, AppNewLink } from "#/shared/links";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/categories/",
)({
	component: CategoriesPage,
});

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
