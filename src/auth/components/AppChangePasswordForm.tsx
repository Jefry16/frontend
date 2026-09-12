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
					{errorMessage && <AppAlert description={errorMessage} />}
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
