import { createFileRoute } from "@tanstack/react-router";
import { AppRegisterForm } from "#/auth";

export const Route = createFileRoute("/auth/register")({
	component: RegisterPage,
});

function RegisterPage() {
	return <AppRegisterForm />;
}
