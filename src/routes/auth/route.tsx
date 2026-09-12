import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { AppRoutePending } from "@vointika/ui";
import { useEffect } from "react";
import { useAuth } from "#/auth";

export const Route = createFileRoute("/auth")({
	component: AuthLayout,
});

function AuthLayout() {
	const { isAuthenticated, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			navigate({ to: "/" });
		}
	}, [isLoading, isAuthenticated, navigate]);

	if (isLoading || isAuthenticated) return <AppRoutePending />;

	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<Outlet />
		</div>
	);
}
