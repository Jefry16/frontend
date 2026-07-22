import { createFileRoute } from "@tanstack/react-router";
import { AppForgotPasswordForm } from "#/auth";

export const Route = createFileRoute("/auth/forgot-password")({
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	return <AppForgotPasswordForm />;
}
