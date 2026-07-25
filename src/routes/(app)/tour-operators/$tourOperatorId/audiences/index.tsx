import { createFileRoute } from "@tanstack/react-router";
import { AppAudiencesList } from "#/audiences";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/audiences/",
)({
	component: AudiencesPage,
});

// Audiences: the operator's pax pricing tiers (Adults, Children, …), reused
// across departures' pricing. Table page → full width.
function AudiencesPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<div className="flex flex-col gap-6 p-6">
			<AppPageHeader
				title={m.audiences()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.catalog() }, { label: m.audiences() }]}
					/>
				}
			/>
			<AppAudiencesList tourOperatorId={tourOperatorId} />
		</div>
	);
}
