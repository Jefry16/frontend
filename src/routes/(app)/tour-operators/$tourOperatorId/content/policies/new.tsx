import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppPolicyForm } from "#/policies";
import { AppWriteGate } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/policies/new",
)({
	component: NewPolicyPage,
});

function NewPolicyPage() {
	const { tourOperatorId } = Route.useParams();
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
			<AppWriteGate>
				<AppPolicyForm tourOperatorId={tourOperatorId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
