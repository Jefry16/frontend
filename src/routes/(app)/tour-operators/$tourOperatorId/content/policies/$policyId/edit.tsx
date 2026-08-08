import { createFileRoute } from "@tanstack/react-router";
import { AppPolicyEdit } from "#/policies";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/policies/$policyId/edit",
)({
	component: EditPolicyPage,
});

function EditPolicyPage() {
	const { tourOperatorId, policyId } = Route.useParams();
	const { canWrite } = usePermissions();
	return (
		<AppPageShell variant="form">
			{canWrite ? (
				<AppPolicyEdit tourOperatorId={tourOperatorId} policyId={policyId} />
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
