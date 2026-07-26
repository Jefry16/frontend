import { createFileRoute } from "@tanstack/react-router";
import { AppAvailabilityEditor } from "#/slots";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/availability/new/$experienceId",
)({
	component: NewAvailabilityPage,
});

// Form page → centered at max-w-3xl (list pages go full width).
function NewAvailabilityPage() {
	const { tourOperatorId, experienceId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
			<AppAvailabilityEditor
				tourOperatorId={tourOperatorId}
				experienceId={experienceId}
			/>
		</div>
	);
}
