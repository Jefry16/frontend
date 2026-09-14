import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppPoliciesList } from "#/policies";
import { usePermissions } from "#/session";
import { AppBreadcrumb, AppNewLink } from "#/shared/links";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/policies/",
)({
	component: PoliciesPage,
});

function PoliciesPage() {
	const { tourOperatorId } = Route.useParams();
	const { canWrite } = usePermissions();
	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.policies()}
				description={m.policies_description()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.content() }, { label: m.policies() }]}
					/>
				}
				actions={
					canWrite && (
						<AppNewLink
							to="/tour-operators/$tourOperatorId/content/policies/new"
							params={{ tourOperatorId }}
						>
							{m.new_policy()}
						</AppNewLink>
					)
				}
			/>
			<AppPoliciesList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
