import { createFileRoute } from "@tanstack/react-router";
import { AppExperienceTranslations } from "#/experiences";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/$experienceId/translations",
)({
	component: ExperienceTranslationsPage,
});

// Single-resource page → centered at max-w-3xl.
function ExperienceTranslationsPage() {
	const { tourOperatorId, experienceId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
			<AppExperienceTranslations
				tourOperatorId={tourOperatorId}
				experienceId={experienceId}
			/>
		</div>
	);
}
