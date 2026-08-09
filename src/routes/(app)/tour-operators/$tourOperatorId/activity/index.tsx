import { createFileRoute } from "@tanstack/react-router";
import { AppActivityList } from "#/audit";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/activity/",
)({
	component: ActivityPage,
});

// Read-only: entries are written by the mutations themselves.
function ActivityPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.activity()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.operations() }, { label: m.activity() }]}
					/>
				}
			/>
			<AppActivityList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
