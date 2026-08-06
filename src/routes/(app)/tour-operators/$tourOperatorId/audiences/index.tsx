import { createFileRoute } from "@tanstack/react-router";
import { AppAudiencesList } from "#/audiences";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/audiences/",
)({
	component: AudiencesPage,
});

// Audiences: the operator's pax pricing tiers (Adults, Children, …), reused
// across departures' pricing. Table page → full width.
function AudiencesPage() {
	const { tourOperatorId } = Route.useParams();
	const { canWrite } = usePermissions();

	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.audiences()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.catalog() }, { label: m.audiences() }]}
					/>
				}
				actions={
					canWrite && (
						<AppNewLink
							to="/tour-operators/$tourOperatorId/audiences/new"
							params={{ tourOperatorId }}
						>
							{m.new_audience()}
						</AppNewLink>
					)
				}
			/>
			<AppAudiencesList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
