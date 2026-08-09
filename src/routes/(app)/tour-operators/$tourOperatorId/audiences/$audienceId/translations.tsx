import { createFileRoute } from "@tanstack/react-router";
import { AppAudienceTranslations } from "#/audiences";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/audiences/$audienceId/translations",
)({
	component: AudienceTranslationsPage,
});

function AudienceTranslationsPage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId, audienceId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppAudienceTranslations
				tourOperatorId={tourOperatorId}
				audienceId={audienceId}
				canWrite={canWrite}
			/>
		</AppPageShell>
	);
}
