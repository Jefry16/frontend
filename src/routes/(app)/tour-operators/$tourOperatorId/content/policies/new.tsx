import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppPolicyForm } from "#/policies";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/policies/new",
)({
	component: NewPolicyPage,
});

// Single-resource page → centered. Static "new" wins over the dynamic
// $policyId sibling.
function NewPolicyPage() {
	const { tourOperatorId } = Route.useParams();
	const { canWrite } = usePermissions();
	return (
		<AppPageShell variant="form">
			<AppPageHeader
				title={m.new_policy()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.content() },
							{
								label: m.policies(),
								to: "/tour-operators/$tourOperatorId/content/policies",
								params: { tourOperatorId },
							},
							{ label: m.new_policy() },
						]}
					/>
				}
			/>
			{canWrite ? (
				<AppPolicyForm tourOperatorId={tourOperatorId} />
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
