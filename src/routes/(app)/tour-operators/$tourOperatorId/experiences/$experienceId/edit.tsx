import { createFileRoute } from "@tanstack/react-router";
import { AppExperienceEdit } from "#/experiences";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { AppWriteGate } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/$experienceId/edit",
)({
	component: EditExperiencePage,
});

// Single-resource page → centered at max-w-3xl.
function EditExperiencePage() {
	const { tourOperatorId, experienceId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
				<AppExperienceEdit
					tourOperatorId={tourOperatorId}
					experienceId={experienceId}
				/>
			</AppWriteGate>
		</AppPageShell>
	);
}
