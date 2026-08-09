import { createFileRoute } from "@tanstack/react-router";
import { AppPolicyEdit } from "#/policies";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { AppWriteGate } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/policies/$policyId/edit",
)({
	component: EditPolicyPage,
});

function EditPolicyPage() {
	const { tourOperatorId, policyId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
				<AppPolicyEdit tourOperatorId={tourOperatorId} policyId={policyId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
