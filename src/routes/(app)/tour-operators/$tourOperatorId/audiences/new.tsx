import { createFileRoute } from "@tanstack/react-router";
import { AppAudienceForm } from "#/audiences";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/audiences/new",
)({
	component: NewAudiencePage,
});

// Single-resource page → centered at max-w-3xl. Static "new" wins over the
// dynamic $audienceId sibling.
function NewAudiencePage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppPageHeader
				title={m.new_audience()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.catalog() },
							{
								label: m.audiences(),
								to: "/tour-operators/$tourOperatorId/audiences",
								params: { tourOperatorId },
							},
							{ label: m.new_audience() },
						]}
					/>
				}
			/>
			{canWrite ? (
				<AppAudienceForm tourOperatorId={tourOperatorId} />
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
