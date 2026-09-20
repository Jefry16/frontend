import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppMetaobjectTranslations } from "#/metaobjects";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metaobjects/entries/$metaobjectId/translations",
)({
	component: MetaobjectTranslationsPage,
});

function MetaobjectTranslationsPage() {
	const { tourOperatorId, metaobjectId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppMetaobjectTranslations
				tourOperatorId={tourOperatorId}
				metaobjectId={metaobjectId}
			/>
		</AppPageShell>
	);
}
