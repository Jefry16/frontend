import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppPageTranslations } from "#/pages";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/pages/$pageId/translations",
)({
	component: PageTranslationsPage,
});

function PageTranslationsPage() {
	const { tourOperatorId, pageId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppPageTranslations tourOperatorId={tourOperatorId} pageId={pageId} />
		</AppPageShell>
	);
}
