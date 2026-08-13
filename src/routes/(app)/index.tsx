import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getPostLoginPath, useAuth } from "#/auth";
import { AppRoutePending } from "#/shared/components/AppRoutePending";

export const Route = createFileRoute("/(app)/")({
	component: IndexRedirect,
});

// "/" is a redirect: send the user to their default operator, or to onboarding
// if they have none. The real landing is the operator home.
function IndexRedirect() {
	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) return;
		navigate({ to: getPostLoginPath(user), replace: true });
	}, [user, navigate]);

	return <AppRoutePending />;
}
