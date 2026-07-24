import { createFileRoute } from "@tanstack/react-router";
import { AppExperienceDetail } from "#/experiences";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/$experienceId/",
)({
	component: ExperienceDetailPage,
});

// Single-resource page → centered at max-w-3xl (list pages go full width).
function ExperienceDetailPage() {
	const { tourOperatorId, experienceId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
			<AppExperienceDetail
				tourOperatorId={tourOperatorId}
				experienceId={experienceId}
			/>
		</div>
	);
}
