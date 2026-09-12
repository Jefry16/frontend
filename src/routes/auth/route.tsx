import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "#/auth";
import { AppRoutePending } from "#/shared/components/AppRoutePending";

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
