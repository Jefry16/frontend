import { createFileRoute } from "@tanstack/react-router";
import { AppExperienceEdit } from "#/experiences";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/$experienceId/edit",
)({
	component: EditExperiencePage,
});

// Single-resource page → centered at max-w-3xl.
function EditExperiencePage() {
	const { tourOperatorId, experienceId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
			<AppExperienceEdit
				tourOperatorId={tourOperatorId}
				experienceId={experienceId}
			/>
		</div>
	);
}
