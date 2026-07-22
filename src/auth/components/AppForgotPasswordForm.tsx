import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppLink } from "#/shared/components/AppLink";
import { useForgotPasswordForm } from "../hooks/use-forgot-password-form";
import { AppAuthFormWrapper } from "./AppAuthFormWrapper";
import { AppAuthMessageCard } from "./AppAuthMessageCard";

// The "forgot password" page: an email form that, once submitted, swaps to a
// neutral "check your inbox" confirmation. The confirmation is deliberately
// vague about whether the address exists (anti-enumeration — matches the 204).
export const AppForgotPasswordForm = () => {
	const { form, isPending, errorMessage, submittedEmail } =
		useForgotPasswordForm();

	if (submittedEmail) {
		return (
			<AppAuthMessageCard
				tone="success"
				title={m.check_your_email_title()}
				description={m.password_reset_sent({ email: submittedEmail })}
			>
				<AppLink to="/auth/login">{m.go_to_sign_in()}</AppLink>
			</AppAuthMessageCard>
		);
	}

	return (
		<AppAuthFormWrapper
			form={form}
			isSubmitting={isPending}
			errorMessage={errorMessage}
			title={m.forgot_password_title()}
			subtitle={m.forgot_password_subtitle()}
			submitLabel={m.send_reset_link()}
			footer={<AppLink to="/auth/login">{m.back_to_sign_in()}</AppLink>}
		>
			<form.Field name="email">
				{(field) => (
					<AppField
						field={field}
						label={m.email()}
						type="email"
						autoComplete="email"
					/>
				)}
			</form.Field>
		</AppAuthFormWrapper>
	);
};
