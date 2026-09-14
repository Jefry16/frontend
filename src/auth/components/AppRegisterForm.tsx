import { AppField, AppPasswordField } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppLink } from "#/shared/links";
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
			footer={<AppLink to="/auth/login">{m.already_have_account()}</AppLink>}
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
