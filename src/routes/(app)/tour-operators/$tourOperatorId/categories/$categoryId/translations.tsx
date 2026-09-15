import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppCategoryTranslations } from "#/categories";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/categories/$categoryId/translations",
)({
	component: CategoryTranslationsPage,
});

function CategoryTranslationsPage() {
	const { tourOperatorId, categoryId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppCategoryTranslations
				tourOperatorId={tourOperatorId}
				categoryId={categoryId}
			/>
		</AppPageShell>
	);
}
