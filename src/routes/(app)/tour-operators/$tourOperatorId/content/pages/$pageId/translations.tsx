import { createFileRoute } from "@tanstack/react-router";
import { AppPageTranslations } from "#/pages";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/pages/$pageId/translations",
)({
	component: PageTranslationsPage,
});

function PageTranslationsPage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId, pageId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppPageTranslations
				tourOperatorId={tourOperatorId}
				pageId={pageId}
				canWrite={canWrite}
			/>
		</AppPageShell>
	);
}
