import { createFileRoute } from "@tanstack/react-router";
import { AppAudienceEdit } from "#/audiences";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/audiences/$audienceId/edit",
)({
	component: EditAudiencePage,
});

// Single-resource page → centered at max-w-3xl.
function EditAudiencePage() {
	const { tourOperatorId, audienceId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppAudienceEdit
				tourOperatorId={tourOperatorId}
				audienceId={audienceId}
			/>
		</AppPageShell>
	);
}
