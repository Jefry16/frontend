import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { useCurrentTourOperator } from "#/tour-operator";

export const Route = createFileRoute("/(app)/tour-operators/$tourOperatorId/")({
	component: TourOperatorDashboard,
});

// The operator dashboard — the post-login landing, rendered inside the shell.
// A thin operator-facts page for now; the real metrics/loops land with their
// feature slices.
function TourOperatorDashboard() {
	const operator = useCurrentTourOperator();

	return (
		<AppPageShell variant="detail">
			<AppPageHeader title={m.dashboard()} />
			{operator && (
				<dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
					<AppDetailField label={m.name()}>{operator.name}</AppDetailField>
					<AppDetailField label={m.timezone()}>
						{operator.timezone}
					</AppDetailField>
				</dl>
			)}
		</AppPageShell>
	);
}
