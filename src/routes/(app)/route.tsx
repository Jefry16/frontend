import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "#/auth";
import { Spinner } from "#/components/ui/spinner";

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
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return <Outlet />;
}
