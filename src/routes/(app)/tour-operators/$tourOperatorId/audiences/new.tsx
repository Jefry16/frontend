import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppAudienceForm } from "#/audiences";
import * as m from "#/paraglide/messages";
import { AppWriteGate } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/audiences/new",
)({
	component: NewAudiencePage,
});

function NewAudiencePage() {
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
			<AppWriteGate>
				<AppAudienceForm tourOperatorId={tourOperatorId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
