import { createFileRoute } from "@tanstack/react-router";
import { AppExperienceEdit } from "#/experiences";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/$experienceId/edit",
)({
	component: EditExperiencePage,
});

// Single-resource page → centered at max-w-3xl.
function EditExperiencePage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId, experienceId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			{canWrite ? (
				<AppExperienceEdit
					tourOperatorId={tourOperatorId}
					experienceId={experienceId}
				/>
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
