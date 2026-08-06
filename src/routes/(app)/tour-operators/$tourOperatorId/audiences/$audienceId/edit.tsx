import { createFileRoute } from "@tanstack/react-router";
import { AppAudienceEdit } from "#/audiences";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/audiences/$audienceId/edit",
)({
	component: EditAudiencePage,
});

// Single-resource page → centered at max-w-3xl.
function EditAudiencePage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId, audienceId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			{canWrite ? (
				<AppAudienceEdit
					tourOperatorId={tourOperatorId}
					audienceId={audienceId}
				/>
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
