import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppExperienceEdit } from "#/experiences";
import { AppWriteGate } from "#/session";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/$experienceId/edit",
)({
	component: EditExperiencePage,
});

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
