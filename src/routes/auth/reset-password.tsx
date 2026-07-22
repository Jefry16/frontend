import { createFileRoute } from "@tanstack/react-router";
import { AppResetPasswordForm } from "#/auth";

export const Route = createFileRoute("/auth/reset-password")({
	validateSearch: (search: Record<string, unknown>): { token?: string } => ({
		token: typeof search.token === "string" ? search.token : undefined,
	}),
	component: ResetPasswordPage,
});

function ResetPasswordPage() {
	const { token } = Route.useSearch();
	return <AppResetPasswordForm token={token} />;
}
