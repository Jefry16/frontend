import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppExperienceTranslations } from "#/experiences";
import { usePermissions } from "#/session";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/$experienceId/translations",
)({
	component: ExperienceTranslationsPage,
});

function ExperienceTranslationsPage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId, experienceId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppExperienceTranslations
				tourOperatorId={tourOperatorId}
				experienceId={experienceId}
				canWrite={canWrite}
			/>
		</AppPageShell>
	);
}
