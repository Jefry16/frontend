import { createFileRoute } from "@tanstack/react-router";
import { AppCategoryDetail } from "#/categories";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/categories/$categoryId/",
)({
	component: CategoryDetailPage,
});

function CategoryDetailPage() {
	const { tourOperatorId, categoryId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppCategoryDetail
				tourOperatorId={tourOperatorId}
				categoryId={categoryId}
			/>
		</AppPageShell>
	);
}
