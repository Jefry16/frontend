import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useAuth } from "#/auth";
import { Button } from "#/components/ui/button";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "#/components/ui/sidebar";
import * as m from "#/paraglide/messages";
import { useCurrentTourOperator } from "#/session";
import { AppLink } from "#/shared/components/AppLink";
import { AppRoutePending } from "#/shared/components/AppRoutePending";
import { AppSettingsSidebar, AppTourOperatorSidebar } from "#/tour-operator";

export const Route = createFileRoute("/(app)/tour-operators/$tourOperatorId")({
	component: TourOperatorLayout,
});

function TourOperatorLayout() {
	const { isLoading } = useAuth();
	const operator = useCurrentTourOperator();
	const matchRoute = useMatchRoute();
	const inSettings = !!matchRoute({
		to: "/tour-operators/$tourOperatorId/settings",
		fuzzy: true,
	});
	const OperatorSidebar = inSettings
		? AppSettingsSidebar
		: AppTourOperatorSidebar;

	if (isLoading) {
		return <AppRoutePending />;
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
					<AppLink to="/">{m.back_home()}</AppLink>
				</Button>
			</div>
		);
	}

	return (
		<SidebarProvider>
			{/* Bypass blocks (WCAG 2.4.1): the sidebar is ~15 links, and a keyboard
			    user met every one of them before reaching the page on every
			    navigation. Hidden until focused, so it costs sighted users nothing. */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-sm focus:outline-2 focus:outline-ring"
			>
				{m.skip_to_content()}
			</a>
			<OperatorSidebar />
			<SidebarInset id="main-content">
				<header className="flex h-14 shrink-0 items-center border-b px-4 md:hidden">
					<SidebarTrigger className="-ml-1" />
				</header>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
