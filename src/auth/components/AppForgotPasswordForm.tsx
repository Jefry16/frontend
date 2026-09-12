import { AppField } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppLink } from "#/shared/components/AppLink";
import { useForgotPasswordForm } from "../hooks/use-forgot-password-form";
import { AppAuthFormWrapper } from "./AppAuthFormWrapper";
import { AppAuthMessageCard } from "./AppAuthMessageCard";

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
