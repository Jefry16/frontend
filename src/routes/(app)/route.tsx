import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "#/auth";
import { AppRoutePending } from "#/shared/components/AppRoutePending";

export const Route = createFileRoute("/(app)")({
	component: AppLayout,
});

// The authenticated shell: everything under it requires a session. While the
// session is resolving we show a spinner; an unauthenticated user is bounced
// to login.
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
