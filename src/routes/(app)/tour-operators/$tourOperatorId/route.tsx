import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useAuth } from "#/auth";
import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "#/components/ui/sidebar";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import {
	AppTourOperatorSidebar,
	useCurrentTourOperator,
} from "#/tour-operator";

export const Route = createFileRoute("/(app)/tour-operators/$tourOperatorId")({
	component: TourOperatorLayout,
});

// The operator workspace shell: sidebar + a top bar + the routed content.
// Guards membership — the operator must be one the signed-in user belongs to
// (its summary rides the profile); non-members get a "no access" fallback.
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

	return (
		<SidebarProvider>
			<AppTourOperatorSidebar />
			<SidebarInset>
				<header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-1 h-4" />
					<span className="font-medium">{operator.name}</span>
				</header>
				<div className="flex-1">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
