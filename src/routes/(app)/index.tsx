import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getPostLoginPath, useAuth } from "#/auth";
import { Spinner } from "#/components/ui/spinner";

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

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Spinner />
		</div>
	);
}
