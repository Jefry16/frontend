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

// Activity: the operator's audit trail — who did what, across every entity,
// newest first. Read-only (entries are written by the mutations themselves).
// Table page → full width.
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
