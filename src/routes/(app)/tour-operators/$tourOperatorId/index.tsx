import { createFileRoute } from "@tanstack/react-router";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import * as m from "#/paraglide/messages";
import { useCurrentTourOperator } from "#/tour-operator";

export const Route = createFileRoute("/(app)/tour-operators/$tourOperatorId/")({
	component: TourOperatorDashboard,
});

// The operator dashboard — the post-login landing, rendered inside the shell.
// Placeholder cards until the real metrics/loops land with their feature slices.
function TourOperatorDashboard() {
	const operator = useCurrentTourOperator();

	return (
		<div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">
					{m.dashboard()}
				</h1>
				<p className="text-sm text-muted-foreground">
					{m.dashboard_subtitle({ name: operator?.name ?? "" })}
				</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[m.bookings(), m.experiences(), m.orders()].map((label) => (
					<Card key={label}>
						<CardHeader>
							<CardTitle className="text-base">{label}</CardTitle>
							<CardDescription>{m.coming_soon()}</CardDescription>
						</CardHeader>
					</Card>
				))}
			</div>
		</div>
	);
}
