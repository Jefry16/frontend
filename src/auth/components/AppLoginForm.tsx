import { Link } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { useLoginForm } from "../hooks/use-login-form";
import { AppAuthFormWrapper } from "./AppAuthFormWrapper";
import { AuthField } from "./AuthField";

export const AppLoginForm = () => {
	const { form, isPending, errorMessage } = useLoginForm();
	return (
		<AppAuthFormWrapper
			form={form}
			isSubmitting={isPending}
			errorMessage={errorMessage}
			title={m.welcome_back()}
			subtitle={m.sign_in_to_your_account()}
			submitLabel={m.sign_in()}
			footer={<Link to="/auth/register">{m.dont_have_account()}</Link>}
		>
			<form.Field name="email">
				{(field) => (
					<AuthField
						field={field}
						label={m.email()}
						type="email"
						autoComplete="email"
					/>
				)}
			</form.Field>
			<form.Field name="password">
				{(field) => (
					<AuthField
						field={field}
						label={m.password()}
						type="password"
						autoComplete="current-password"
					/>
				)}
			</form.Field>
		</AppAuthFormWrapper>
	);
};
