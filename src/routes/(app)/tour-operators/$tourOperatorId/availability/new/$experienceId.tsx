import { createFileRoute } from "@tanstack/react-router";
import { AppWriteGate } from "#/session";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { AppAvailabilityEditor } from "#/slots";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/availability/new/$experienceId",
)({
	component: NewAvailabilityPage,
});

function NewAvailabilityPage() {
	const { tourOperatorId, experienceId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
				<AppAvailabilityEditor
					tourOperatorId={tourOperatorId}
					experienceId={experienceId}
				/>
			</AppWriteGate>
		</AppPageShell>
	);
}
