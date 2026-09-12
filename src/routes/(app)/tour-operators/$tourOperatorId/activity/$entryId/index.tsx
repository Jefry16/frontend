import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppActivityEntryDetail } from "#/audit";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/activity/$entryId/",
)({
	component: ActivityEntryPage,
});

function ActivityEntryPage() {
	const { tourOperatorId, entryId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppActivityEntryDetail
				tourOperatorId={tourOperatorId}
				entryId={entryId}
			/>
		</AppPageShell>
	);
}
