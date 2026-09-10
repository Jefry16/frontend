import type { AnyFieldApi } from "@tanstack/react-form";
import type { ReactNode } from "react";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";

export const AppOperatorAddressFields = ({
	form,
}: {
	form: {
		// biome-ignore lint/suspicious/noExplicitAny: no shared FieldComponent type — see above
		Field: (props: any) => ReactNode | Promise<ReactNode>;
	};
}) => {
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
		</>
	);
};
