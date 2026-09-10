import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { useCurrentTourOperator } from "#/session";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute("/(app)/tour-operators/$tourOperatorId/")({
	component: TourOperatorDashboard,
});

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
