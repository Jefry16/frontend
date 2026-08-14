import { createFileRoute } from "@tanstack/react-router";
import { AppAudienceEdit } from "#/audiences";
import { AppWriteGate } from "#/session";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/audiences/$audienceId/edit",
)({
	component: EditAudiencePage,
});

function EditAudiencePage() {
	const { tourOperatorId, audienceId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
				<AppAudienceEdit
					tourOperatorId={tourOperatorId}
					audienceId={audienceId}
				/>
			</AppWriteGate>
		</AppPageShell>
	);
}
