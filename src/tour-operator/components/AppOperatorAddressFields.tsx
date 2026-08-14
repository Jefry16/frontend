import type { AnyFieldApi } from "@tanstack/react-form";
import { type ReactNode, useMemo } from "react";
import * as m from "#/paraglide/messages";
import { useCountries } from "#/reference";
import { AppComboboxField } from "#/shared/components/AppComboboxField";
import { AppField } from "#/shared/components/AppField";

/**
 * The operator's postal address, as the six fields the backend's
 * TourOperatorAddress carries. Shared because both write paths need exactly
 * this block: onboarding creates the operator and Settings → General edits it,
 * and the shape is the backend's, not either screen's.
 *
 * The form is typed by the surface used rather than by TanStack's form
 * generics, the way AppAuthFormWrapper types its own — the two callers' forms
 * differ in every field except `address`.
 *
 * `address1`, `city` and `countryId` are required; the rest are optional and
 * stay "" rather than null, because the backend clears an optional column with
 * a blank string.
 */
export const AppOperatorAddressFields = ({
	form,
}: {
	/**
	 * Typed by the surface used, the way AppAuthFormWrapper types its own form
	 * prop. TanStack's `Field` carries twelve generics that differ per form, so
	 * there is no shared type the create form and the details form both satisfy —
	 * and they share only the `address` sub-shape anyway. The field the render
	 * prop receives IS typed, as AnyFieldApi, which is what the children use.
	 */
	// The return is ReactNode | Promise<ReactNode> because TanStack's Field
	// allows an async render prop; narrowing it to ReactNode makes neither
	// caller's form assignable.
	form: {
		// biome-ignore lint/suspicious/noExplicitAny: no shared FieldComponent type — see above
		Field: (props: any) => ReactNode | Promise<ReactNode>;
	};
}) => {
	const { data: countries = [] } = useCountries();
	const countryOptions = useMemo(
		() => countries.map((c) => ({ value: c.id, label: c.name })),
		[countries],
	);

	return (
		<>
			<form.Field name="address.address1">
				{(field: AnyFieldApi) => (
					<AppField field={field} label={m.address_line1()} required />
				)}
			</form.Field>
			<form.Field name="address.address2">
				{(field: AnyFieldApi) => (
					<AppField
						field={field}
						label={m.address_line2()}
						description={m.operator_optional_hint()}
					/>
				)}
			</form.Field>
			<form.Field name="address.city">
				{(field: AnyFieldApi) => (
					<AppField field={field} label={m.city()} required />
				)}
			</form.Field>
			<form.Field name="address.province">
				{(field: AnyFieldApi) => (
					<AppField
						field={field}
						label={m.province()}
						description={m.operator_optional_hint()}
					/>
				)}
			</form.Field>
			<form.Field name="address.zip">
				{(field: AnyFieldApi) => (
					<AppField
						field={field}
						label={m.zip()}
						description={m.operator_optional_hint()}
					/>
				)}
			</form.Field>
			<form.Field name="address.countryId">
				{(field: AnyFieldApi) => (
					<AppComboboxField
						field={field}
						label={m.country()}
						items={countryOptions}
						required
					/>
				)}
			</form.Field>
		</>
	);
};
