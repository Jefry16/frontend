import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppExperienceDetail } from "#/experiences";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/$experienceId/",
)({
	component: ExperienceDetailPage,
});

function ExperienceDetailPage() {
	const { tourOperatorId, experienceId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppExperienceDetail
				tourOperatorId={tourOperatorId}
				experienceId={experienceId}
			/>
		</AppPageShell>
	);
}
