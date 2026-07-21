import { Link } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { useRegisterForm } from "../hooks/use-register-form";
import { AppAuthFormWrapper } from "./AppAuthFormWrapper";
import { AuthField } from "./AuthField";

export const AppRegisterForm = () => {
	const { form, isPending, errorMessage } = useRegisterForm();
	return (
		<AppAuthFormWrapper
			form={form}
			isSubmitting={isPending}
			errorMessage={errorMessage}
			title={m.create_your_account()}
			subtitle={m.sign_up_to_get_started()}
			submitLabel={m.register()}
			footer={<Link to="/auth/login">{m.already_have_account()}</Link>}
		>
			<form.Field name="name">
				{(field) => (
					<AuthField field={field} label={m.name()} autoComplete="name" />
				)}
			</form.Field>
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
						description={m.password_requirements()}
						autoComplete="new-password"
					/>
				)}
			</form.Field>
			<form.Field name="confirmPassword">
				{(field) => (
					<AuthField
						field={field}
						label={m.confirm_password()}
						type="password"
						autoComplete="new-password"
					/>
				)}
			</form.Field>
		</AppAuthFormWrapper>
	);
};
