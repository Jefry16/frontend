import { AppField, AppPasswordField } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppLink } from "#/shared/links";
import { useLoginForm } from "../hooks/use-login-form";
import { AppAuthFormWrapper } from "./AppAuthFormWrapper";

export const AppLoginForm = () => {
	const { form, isPending, errorMessage, notVerified } = useLoginForm();
	return (
		<AppAuthFormWrapper
			form={form}
			isSubmitting={isPending}
			errorMessage={errorMessage}
			title={m.welcome_back()}
			subtitle={m.sign_in_to_your_account()}
			submitLabel={m.sign_in()}
			footer={
				<>
					{notVerified && (
						<form.Subscribe selector={(s) => s.values.email}>
							{(email) => (
								<AppLink to="/auth/verify-email" search={{ email }}>
									{m.resend_verification()}
								</AppLink>
							)}
						</form.Subscribe>
					)}
					<AppLink to="/auth/forgot-password">
						{m.forgot_password_link()}
					</AppLink>
					<AppLink to="/auth/register">{m.dont_have_account()}</AppLink>
				</>
			}
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
			<form.Field name="password">
				{(field) => (
					<AppPasswordField
						field={field}
						label={m.password()}
						autoComplete="current-password"
					/>
				)}
			</form.Field>
		</AppAuthFormWrapper>
	);
};
