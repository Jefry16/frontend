import { createFileRoute } from "@tanstack/react-router";
import { AppContactMessagesList } from "#/contact";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/inbox/",
)({
	component: InboxPage,
});

function InboxPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.inbox()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.operations() }, { label: m.inbox() }]}
					/>
				}
			/>
			<AppContactMessagesList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
