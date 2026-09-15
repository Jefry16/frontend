import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppPolicyTranslations } from "#/policies";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/policies/$policyId/translations",
)({
	component: PolicyTranslationsPage,
});

function PolicyTranslationsPage() {
	const { tourOperatorId, policyId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppPolicyTranslations
				tourOperatorId={tourOperatorId}
				policyId={policyId}
			/>
		</AppPageShell>
	);
}
