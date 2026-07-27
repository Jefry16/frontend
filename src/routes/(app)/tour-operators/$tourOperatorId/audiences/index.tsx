import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppAudiencesList } from "#/audiences";
import { Button } from "#/components/ui/button";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppLink } from "#/shared/components/AppLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";

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
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.audiences()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.catalog() }, { label: m.audiences() }]}
					/>
				}
				actions={
					<Button asChild>
						<AppLink
							to="/tour-operators/$tourOperatorId/audiences/new"
							params={{ tourOperatorId }}
						>
							<Plus />
							{m.new_audience()}
						</AppLink>
					</Button>
				}
			/>
			<AppAudiencesList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
