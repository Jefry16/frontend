import { createFileRoute } from "@tanstack/react-router";
import { AppLoginForm } from "#/auth";

export const Route = createFileRoute("/auth/login")({
	component: LoginPage,
});

function LoginPage() {
	return <AppLoginForm />;
}
