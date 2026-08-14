import { createFileRoute } from "@tanstack/react-router";
import { AppPolicyEdit } from "#/policies";
import { AppWriteGate } from "#/session";
import { AppPageShell } from "#/shared/components/AppPageShell";

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
