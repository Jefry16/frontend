import { createFileRoute } from "@tanstack/react-router";
import { AppPolicyTranslations } from "#/policies";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/policies/$policyId/translations",
)({
	component: PolicyTranslationsPage,
});

function PolicyTranslationsPage() {
	const { tourOperatorId, policyId } = Route.useParams();
	const { canWrite } = usePermissions();
	return (
		<AppPageShell variant="form">
			<AppPolicyTranslations
				tourOperatorId={tourOperatorId}
				policyId={policyId}
				canWrite={canWrite}
			/>
		</AppPageShell>
	);
}
