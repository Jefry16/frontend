import * as m from "#/paraglide/messages";
import { AppLink } from "#/shared/components/AppLink";
import { AppPasswordField } from "#/shared/components/AppPasswordField";
import { useResetPasswordForm } from "../hooks/use-reset-password-form";
import { AppAuthFormWrapper } from "./AppAuthFormWrapper";
import { AppAuthMessageCard } from "./AppAuthMessageCard";

export const AppResetPasswordForm = ({ token }: { token?: string }) => {
	if (!token) {
		return (
			<AppAuthMessageCard
				tone="destructive"
				title={m.reset_link_invalid_title()}
				description={m.reset_link_missing_token()}
			>
				<AppLink to="/auth/forgot-password">
					{m.request_new_reset_link()}
				</AppLink>
			</AppAuthMessageCard>
		);
	}
	return <ResetPasswordForm token={token} />;
};

const ResetPasswordForm = ({ token }: { token: string }) => {
	const { form, isPending, errorMessage } = useResetPasswordForm(token);
	return (
		<AppAuthFormWrapper
			form={form}
			isSubmitting={isPending}
			errorMessage={errorMessage}
			title={m.reset_password_title()}
			subtitle={m.reset_password_subtitle()}
			submitLabel={m.reset_password_submit()}
			footer={<AppLink to="/auth/login">{m.back_to_sign_in()}</AppLink>}
		>
			<form.Field name="password">
				{(field) => (
					<AppPasswordField
						field={field}
						label={m.new_password()}
						description={m.password_requirements()}
						autoComplete="new-password"
					/>
				)}
			</form.Field>
			<form.Field name="confirmPassword">
				{(field) => (
					<AppPasswordField
						field={field}
						label={m.confirm_password()}
						autoComplete="new-password"
					/>
				)}
			</form.Field>
		</AppAuthFormWrapper>
	);
};
