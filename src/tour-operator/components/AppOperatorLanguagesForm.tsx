import { Card, CardContent } from "#/components/ui/card";
import { Checkbox } from "#/components/ui/checkbox";
import {
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLegend,
	FieldSet,
} from "#/components/ui/field";
import { Label } from "#/components/ui/label";
import { SelectItem } from "#/components/ui/select";
import * as m from "#/paraglide/messages";
import { useLanguages } from "#/reference";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppSelectField } from "#/shared/components/AppSelectField";
import { RequiredMark } from "#/shared/components/RequiredMark";
import { useOperatorLanguagesForm } from "../hooks/use-operator-languages-form";
import type { OperatorLocales } from "../locales";
import { localeLabel } from "../locales";

// The Languages settings form (ADMIN+): pick the supported content languages,
// then the primary one among them. The offerable set comes from the backend
// allowlist (reference.languages) unioned with the operator's already-supported
// locales, so a language later dropped from the allowlist stays visible (and
// removable) rather than silently vanishing from an operator still using it.
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

	// Labels in the current UI language (Intl.DisplayNames), with the allowlist's
	// own name as the fallback. The union keeps a locale the operator already
	// supports selectable even if it's since been dropped from the allowlist.
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
		<Card>
			<CardContent>
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
						<form.Field name="supportedLocales">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched &&
									field.state.meta.errors.length > 0;
								const selected = field.state.value;
								return (
									// A checkbox GROUP: fieldset/legend for the group label (a
									// bare <label> with no control fails a11y), and per-row
									// htmlFor association — the Radix Checkbox is a <button>, so
									// wrapping it in a <label> never links it to the control.
									<FieldSet>
										<FieldLegend variant="label">
											{m.supported_languages()}
											<RequiredMark />
										</FieldLegend>
										<FieldDescription>
											{m.supported_languages_help()}
										</FieldDescription>
										<div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-3">
											{options.map((locale) => {
												const inputId = `supported-locale-${locale.code}`;
												return (
													<div
														key={locale.code}
														className="flex items-center gap-2"
													>
														<Checkbox
															id={inputId}
															checked={selected.includes(locale.code)}
															onCheckedChange={(next) => {
																field.handleChange(
																	next === true
																		? [...selected, locale.code]
																		: selected.filter((c) => c !== locale.code),
																);
																// Unchecking the current primary leaves it
																// unsupported — clear it so the select isn't
																// stuck on a now-hidden value.
																if (
																	next !== true &&
																	form.state.values.primaryLocale ===
																		locale.code
																) {
																	form.setFieldValue("primaryLocale", "");
																}
															}}
														/>
														<Label htmlFor={inputId} className="font-normal">
															{locale.label}
														</Label>
													</div>
												);
											})}
										</div>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</FieldSet>
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

					<AppFormActions
						isPending={isPending}
						submitLabel={m.save_changes()}
					/>
				</form>
			</CardContent>
		</Card>
	);
};
