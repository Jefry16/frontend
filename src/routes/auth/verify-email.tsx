import { createFileRoute } from "@tanstack/react-router";
import { AppVerifyEmailNotice } from "#/auth";

export const Route = createFileRoute("/auth/verify-email")({
	validateSearch: (search: Record<string, unknown>): { email?: string } => ({
		email: typeof search.email === "string" ? search.email : undefined,
	}),
	component: VerifyEmailPage,
});

function VerifyEmailPage() {
	const { email } = Route.useSearch();
	return <AppVerifyEmailNotice email={email} />;
}
