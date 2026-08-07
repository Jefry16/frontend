import { createFileRoute } from "@tanstack/react-router";
import { AppExperienceTranslations } from "#/experiences";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/$experienceId/translations",
)({
	component: ExperienceTranslationsPage,
});

// Single-resource page → centered at max-w-3xl.
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
