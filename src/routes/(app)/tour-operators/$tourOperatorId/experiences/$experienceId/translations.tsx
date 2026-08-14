import { createFileRoute } from "@tanstack/react-router";
import { AppExperienceTranslations } from "#/experiences";
import { usePermissions } from "#/session";
import { AppPageShell } from "#/shared/components/AppPageShell";

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
