import { createFileRoute } from "@tanstack/react-router";
import { AppActivityEntryDetail } from "#/audit";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/activity/$entryId/",
)({
	component: ActivityEntryPage,
});

// Single-resource page → centered at max-w-3xl (list pages go full width).
function ActivityEntryPage() {
	const { tourOperatorId, entryId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
			<AppActivityEntryDetail
				tourOperatorId={tourOperatorId}
				entryId={entryId}
			/>
		</div>
	);
}
