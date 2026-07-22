import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useAuth } from "#/auth";
import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { useCurrentTourOperator } from "#/tour-operator";

export const Route = createFileRoute("/(app)/tour-operators/$tourOperatorId")({
	component: TourOperatorLayout,
});

// The operator shell: everything nested under an operator renders here. Guards
// membership — the operator must be one the signed-in user belongs to (its
// summary rides the profile). Non-members get a "no access" fallback rather
// than a broken page. (Nav/sidebar chrome lands in a later slice.)
function TourOperatorLayout() {
	const { isLoading } = useAuth();
	const operator = useCurrentTourOperator();

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (!operator) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
				<div className="space-y-1">
					<h1 className="text-xl font-semibold">
						{m.operator_no_access_title()}
					</h1>
					<p className="text-sm text-muted-foreground">
						{m.operator_no_access_body()}
					</p>
				</div>
				<Button asChild variant="outline">
					<Link to="/">{m.back_home()}</Link>
				</Button>
			</div>
		);
	}

	return <Outlet />;
}
