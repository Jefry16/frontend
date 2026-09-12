import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { AppRoutePending } from "@vointika/ui";
import { useEffect } from "react";
import { useAuth } from "#/auth";

export const Route = createFileRoute("/(app)")({
	component: AppLayout,
});

function AppLayout() {
	const { isAuthenticated, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			navigate({ to: "/auth/login" });
		}
	}, [isLoading, isAuthenticated, navigate]);

	if (isLoading || !isAuthenticated) {
		return <AppRoutePending />;
	}

	return <Outlet />;
}
