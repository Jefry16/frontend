import {
	AppCheckboxField,
	AppDetailField,
	AppForm,
	AppFormActions,
	AppFormSkeleton,
	AppPasswordField,
	AppQueryState,
	AppSettingsCard,
	AppTextareaField,
	EmptyValue,
	FieldGroup,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import {
	type StorefrontPasswordSettings,
	useStorefrontPassword,
	useStorefrontPasswordForm,
} from "../hooks/use-storefront-password";

export const AppStorefrontPasswordCard = ({
	tourOperatorId,
	canWrite,
}: {
	tourOperatorId: string;
	canWrite: boolean;
}) => {
	const query = useStorefrontPassword(tourOperatorId);

	return (
		<AppSettingsCard
			title={m.store_access()}
			description={m.store_access_hint()}
		>
			<AppQueryState
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
			</AppQueryState>
		</AppSettingsCard>
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
		<AppForm
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			actions={
				<AppFormActions isPending={isPending} submitLabel={m.save_changes()} />
			}
		>
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
		</AppForm>
	);
};

const StoreAccessSummary = ({
	settings,
}: {
	settings: StorefrontPasswordSettings;
}) => {
	return (
		<dl className="flex flex-col gap-6">
			<AppDetailField label={m.store_access()}>
				{settings.enabled ? m.store_access_on() : m.store_access_off()}
			</AppDetailField>
			<AppDetailField label={m.visitor_message()}>
				{settings.message ?? <EmptyValue />}
			</AppDetailField>
		</dl>
	);
};
