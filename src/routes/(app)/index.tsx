import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppRoutePending } from "@vointika/ui";
import { useEffect } from "react";
import { getPostLoginPath, useAuth } from "#/auth";

export const Route = createFileRoute("/(app)/")({
	component: IndexRedirect,
});

function IndexRedirect() {
	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) return;
		navigate({ to: getPostLoginPath(user), replace: true });
	}, [user, navigate]);

	return <AppRoutePending />;
}
