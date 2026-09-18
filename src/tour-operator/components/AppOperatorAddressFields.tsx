import type { AnyFieldApi } from "@tanstack/react-form";
import { AppField } from "@vointika/ui";
import type { ReactNode } from "react";
import * as m from "#/paraglide/messages";

export const AppOperatorAddressFields = ({
	form,
}: {
	form: {
		// biome-ignore lint/suspicious/noExplicitAny: TanStack Form exports no FieldComponent type to name here
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
			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="address.address2">
					{(field: AnyFieldApi) => (
						<AppField field={field} label={m.address_line2()} />
					)}
				</form.Field>
				<form.Field name="address.city">
					{(field: AnyFieldApi) => (
						<AppField field={field} label={m.city()} required />
					)}
				</form.Field>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="address.province">
					{(field: AnyFieldApi) => (
						<AppField field={field} label={m.province()} />
					)}
				</form.Field>
				<form.Field name="address.zip">
					{(field: AnyFieldApi) => <AppField field={field} label={m.zip()} />}
				</form.Field>
			</div>
		</>
	);
};
