import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppActivityList } from "#/audit";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/activity/",
)({
	component: ActivityPage,
});

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
