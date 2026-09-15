import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppAudienceTranslations } from "#/audiences";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/audiences/$audienceId/translations",
)({
	component: AudienceTranslationsPage,
});

function AudienceTranslationsPage() {
	const { tourOperatorId, audienceId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppAudienceTranslations
				tourOperatorId={tourOperatorId}
				audienceId={audienceId}
			/>
		</AppPageShell>
	);
}
