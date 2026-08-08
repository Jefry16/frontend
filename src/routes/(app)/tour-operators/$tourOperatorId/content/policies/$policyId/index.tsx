import { createFileRoute } from "@tanstack/react-router";
import { AppPolicyDetail } from "#/policies";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/policies/$policyId/",
)({
	component: PolicyDetailPage,
});

function PolicyDetailPage() {
	const { tourOperatorId, policyId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppPolicyDetail tourOperatorId={tourOperatorId} policyId={policyId} />
		</AppPageShell>
	);
}
