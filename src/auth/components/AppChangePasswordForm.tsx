import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppPasswordField } from "#/shared/components/AppPasswordField";
import { useChangePasswordForm } from "../hooks/use-change-password-form";

// The change-password card: current + new + confirm, validated against the
// shared password policy. On success the fields clear (form.reset in the hook).
export const AppChangePasswordForm = () => {
	const { form, isPending, errorMessage } = useChangePasswordForm();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{m.password()}</CardTitle>
				<CardDescription>{m.change_password_description()}</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					{errorMessage && (
						<AppAlert title={m.error()} description={errorMessage} />
					)}
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
					<AppFormActions
						isPending={isPending}
						submitLabel={m.change_password()}
					/>
				</form>
			</CardContent>
		</Card>
	);
};
