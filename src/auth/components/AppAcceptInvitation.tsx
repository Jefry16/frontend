import { useQuery } from "@tanstack/react-query";
import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { authApi } from "#/lib/api";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppLink } from "#/shared/components/AppLink";
import { AppPasswordField } from "#/shared/components/AppPasswordField";
import { useAuth } from "../AuthProvider";
import { useAcceptInvitation } from "../hooks/use-accept-invitation";
import { AppAuthFormWrapper } from "./AppAuthFormWrapper";
import { AppAuthMessageCard } from "./AppAuthMessageCard";

interface Preview {
	context: string;
	operatorName: string;
	email: string;
}

export const AppAcceptInvitation = ({ token }: { token?: string }) => {
	if (!token) {
		return (
			<AppAuthMessageCard
				tone="destructive"
				title={m.invitation_invalid_title()}
				description={m.invitation_link_missing_token()}
			>
				<AppLink to="/auth/login">{m.go_to_sign_in()}</AppLink>
			</AppAuthMessageCard>
		);
	}
	return <AcceptFlow token={token} />;
};

const AcceptFlow = ({ token }: { token: string }) => {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const { form, isPending, errorMessage, acceptAsCurrentUser } =
		useAcceptInvitation(token);

	const preview = useQuery<Preview>({
		queryKey: ["invitation-preview", token],
		queryFn: async () =>
			(await authApi.get<Preview>(`/invitations/${token}/preview`)).data,
		retry: false,
	});

	if (authLoading || preview.isPending) {
		return <AppAuthMessageCard icon={<Spinner />} description={m.loading()} />;
	}
	if (preview.isError) {
		return (
			<AppAuthMessageCard
				tone="destructive"
				title={m.invitation_invalid_title()}
				description={m.invitation_link_invalid()}
			>
				<AppLink to="/auth/login">{m.go_to_sign_in()}</AppLink>
			</AppAuthMessageCard>
		);
	}

	const operator = preview.data.operatorName;

	if (isAuthenticated) {
		return (
			<AppAuthMessageCard
				title={m.accept_invitation_title()}
				description={m.accept_invitation_body({ operator })}
			>
				{errorMessage && (
					<p className="text-sm text-destructive">{errorMessage}</p>
				)}
				<Button onClick={acceptAsCurrentUser} disabled={isPending}>
					{isPending && <Spinner />}
					{m.accept_invitation()}
				</Button>
			</AppAuthMessageCard>
		);
	}

	return (
		<AppAuthFormWrapper
			form={form}
			isSubmitting={isPending}
			errorMessage={errorMessage}
			title={m.accept_invitation_title()}
			subtitle={m.accept_invitation_signup({ operator })}
			submitLabel={m.accept_invitation()}
			footer={<AppLink to="/auth/login">{m.invitation_have_account()}</AppLink>}
		>
			<form.Field name="name">
				{(field) => (
					<AppField field={field} label={m.name()} autoComplete="name" />
				)}
			</form.Field>
			<form.Field name="password">
				{(field) => (
					<AppPasswordField
						field={field}
						label={m.password()}
						description={m.password_requirements()}
						autoComplete="new-password"
					/>
				)}
			</form.Field>
		</AppAuthFormWrapper>
	);
};
