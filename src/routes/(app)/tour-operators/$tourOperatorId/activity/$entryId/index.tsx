import { createFileRoute } from "@tanstack/react-router";
import { AppActivityEntryDetail } from "#/audit";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/activity/$entryId/",
)({
	component: ActivityEntryPage,
});

// Single-resource page → centered at max-w-3xl (list pages go full width).
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
