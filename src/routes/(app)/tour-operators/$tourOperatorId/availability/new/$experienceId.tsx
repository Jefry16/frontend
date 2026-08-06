import { createFileRoute } from "@tanstack/react-router";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { AppAvailabilityEditor } from "#/slots";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/availability/new/$experienceId",
)({
	component: NewAvailabilityPage,
});

// Form page → centered at max-w-3xl (list pages go full width).
function NewAvailabilityPage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId, experienceId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			{canWrite ? (
				<AppAvailabilityEditor
					tourOperatorId={tourOperatorId}
					experienceId={experienceId}
				/>
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
