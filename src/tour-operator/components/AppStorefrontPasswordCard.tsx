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
import { AppCardBody } from "#/shared/components/AppCardBody";
import { AppCheckboxField } from "#/shared/components/AppCheckboxField";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormSkeleton } from "#/shared/components/AppFormSkeleton";
import { AppPasswordField } from "#/shared/components/AppPasswordField";
import { AppTextareaField } from "#/shared/components/AppTextareaField";
import {
	type StorefrontPasswordSettings,
	useStorefrontPassword,
	useStorefrontPasswordForm,
} from "../hooks/use-storefront-password";

// Settings → General → Store access (Shopify's password protection): restrict
// the storefront to visitors with the shared password, plus the optional
// message the password page shows. The password is member-visible by design —
// it's the gate the operator hands out, not a credential.
export const AppStorefrontPasswordCard = ({
	tourOperatorId,
	canWrite,
}: {
	tourOperatorId: string;
	/** ADMIN+. False shows the settings read-only — the read is member-level. */
	canWrite: boolean;
}) => {
	const query = useStorefrontPassword(tourOperatorId);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{m.store_access()}</CardTitle>
				<CardDescription>{m.store_access_hint()}</CardDescription>
			</CardHeader>
			<CardContent>
				<AppCardBody
					query={query}
					loading={<AppFormSkeleton rows={3} card={false} />}
				>
					{(settings) =>
						canWrite ? (
							<StoreAccessForm
								tourOperatorId={tourOperatorId}
								settings={settings}
							/>
						) : (
							<StoreAccessSummary settings={settings} />
						)
					}
				</AppCardBody>
			</CardContent>
		</Card>
	);
};

const StoreAccessForm = ({
	tourOperatorId,
	settings,
}: {
	tourOperatorId: string;
	settings: StorefrontPasswordSettings;
}) => {
	const { form, isPending, errorMessage } = useStorefrontPasswordForm(
		tourOperatorId,
		settings,
	);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-6"
		>
			{errorMessage && (
				<AppAlert title={m.error()} description={errorMessage} />
			)}
			<FieldGroup>
				<form.Field name="enabled">
					{(field) => (
						<AppCheckboxField
							field={field}
							label={m.store_access_toggle()}
							description={m.store_access_toggle_hint()}
						/>
					)}
				</form.Field>
				<form.Field name="password">
					{(field) => (
						<AppPasswordField
							field={field}
							label={m.password()}
							description={m.store_access_password_hint()}
						/>
					)}
				</form.Field>
				<form.Field name="message">
					{(field) => (
						<AppTextareaField
							field={field}
							label={m.visitor_message()}
							description={m.store_access_hint()}
							rows={3}
						/>
					)}
				</form.Field>
			</FieldGroup>
			<AppFormActions isPending={isPending} submitLabel={m.save_changes()} />
		</form>
	);
};

const StoreAccessSummary = ({
	settings,
}: {
	settings: StorefrontPasswordSettings;
}) => {
	const none = <span className="text-muted-foreground">{m.not_set()}</span>;
	return (
		<dl className="flex flex-col gap-6">
			<AppDetailField label={m.store_access()}>
				{settings.enabled ? m.store_access_on() : m.store_access_off()}
			</AppDetailField>
			<AppDetailField label={m.visitor_message()}>
				{settings.message ?? none}
			</AppDetailField>
		</dl>
	);
};
