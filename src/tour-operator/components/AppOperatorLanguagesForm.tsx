import {
	AppCheckboxGroupField,
	AppForm,
	AppFormActions,
	AppSelectField,
	FieldGroup,
	SelectItem,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { useLanguages } from "#/reference";
import type { OperatorLocales } from "#/session";
import { localeLabel } from "#/session";
import { useOperatorLanguagesForm } from "../hooks/use-operator-languages-form";

export const AppOperatorLanguagesForm = ({
	tourOperatorId,
	locales,
}: {
	tourOperatorId: string;
	locales: OperatorLocales;
}) => {
	const { form, isPending, errorMessage } = useOperatorLanguagesForm(
		tourOperatorId,
		locales,
	);
	const { data: allowlist = [] } = useLanguages();

	const options = [
		...allowlist.map((l) => ({
			code: l.code,
			label: localeLabel(l.code, l.name),
		})),
		...locales.supportedLocales
			.filter((code) => !allowlist.some((l) => l.code === code))
			.map((code) => ({ code, label: localeLabel(code) })),
	];

	return (
		<AppForm
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			actions={
				<AppFormActions isPending={isPending} submitLabel={m.save_changes()} />
			}
		>
			<FieldGroup>
				<form.Field name="supportedLocales">
					{(field) => {
						const selected = field.state.value as string[];
						return (
							<AppCheckboxGroupField
								field={field}
								label={m.supported_languages()}
								description={m.supported_languages_help()}
								required
								layout="grid"
								options={options.map((locale) => ({
									value: locale.code,
									label: locale.label,
								}))}
								onChanged={(next) => {
									if (
										!next.includes(form.state.values.primaryLocale) &&
										selected.includes(form.state.values.primaryLocale)
									) {
										form.setFieldValue("primaryLocale", "");
									}
								}}
							/>
						);
					}}
				</form.Field>

				<form.Subscribe selector={(s) => s.values.supportedLocales}>
					{(supported) => (
						<form.Field name="primaryLocale">
							{(field) => (
								<AppSelectField
									field={field}
									label={m.primary_language()}
									description={m.primary_language_help()}
									placeholder={m.select_option()}
								>
									{options
										.filter((locale) => supported.includes(locale.code))
										.map((locale) => (
											<SelectItem key={locale.code} value={locale.code}>
												{locale.label}
											</SelectItem>
										))}
								</AppSelectField>
							)}
						</form.Field>
					)}
				</form.Subscribe>
			</FieldGroup>
		</AppForm>
	);
};
