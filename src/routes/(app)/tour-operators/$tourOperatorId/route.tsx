import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useAuth } from "#/auth";
import { Button } from "#/components/ui/button";
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

// The operator workspace shell: sidebar + the routed content. No desktop top
// bar (the sidebar is always visible; toggle via its rail or Ctrl/Cmd+B) — only
// a mobile strip holding the SidebarTrigger to open the sidebar sheet.
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
				<header className="flex h-14 shrink-0 items-center border-b px-4 md:hidden">
					<SidebarTrigger className="-ml-1" />
				</header>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
