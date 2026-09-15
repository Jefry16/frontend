import {
	AppForm,
	AppFormActions,
	AppPasswordField,
	AppSettingsCard,
	FieldGroup,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { useChangePasswordForm } from "../hooks/use-change-password-form";

export const AppChangePasswordForm = () => {
	const { form, isPending, errorMessage } = useChangePasswordForm();

	return (
		<AppSettingsCard
			title={m.password()}
			description={m.change_password_description()}
		>
			<AppForm
				onSubmit={form.handleSubmit}
				errorMessage={errorMessage}
				actions={
					<AppFormActions
						isPending={isPending}
						submitLabel={m.change_password()}
					/>
				}
			>
				<FieldGroup>
					<form.Field name="currentPassword">
						{(field) => (
							<AppPasswordField
								field={field}
								label={m.current_password()}
								autoComplete="current-password"
							/>
						)}
					</form.Field>
					<form.Field name="newPassword">
						{(field) => (
							<AppPasswordField
								field={field}
								label={m.new_password()}
								autoComplete="new-password"
							/>
						)}
					</form.Field>
					<form.Field name="confirmPassword">
						{(field) => (
							<AppPasswordField
								field={field}
								label={m.confirm_new_password()}
								autoComplete="new-password"
							/>
						)}
					</form.Field>
				</FieldGroup>
			</AppForm>
		</AppSettingsCard>
	);
};
