import { Link } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppPasswordField } from "#/shared/components/AppPasswordField";
import { useRegisterForm } from "../hooks/use-register-form";
import { AppAuthFormWrapper } from "./AppAuthFormWrapper";

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
					<AppField field={field} label={m.name()} autoComplete="name" />
				)}
			</form.Field>
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
