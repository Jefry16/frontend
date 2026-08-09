import { createFileRoute } from "@tanstack/react-router";
import { AppExperienceDetail } from "#/experiences";
import { AppPageShell } from "#/shared/components/AppPageShell";

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
