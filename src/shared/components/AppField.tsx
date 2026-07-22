import type { AnyFieldApi } from "@tanstack/react-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";

interface AppFieldProps {
	field: AnyFieldApi;
	label: string;
	type?: "text" | "email" | "password";
	description?: string;
	autoComplete?: string;
}

// The form-field renderer: a shadcn Field wrapping an Input bound to a TanStack
// Form field, with the field's validation errors below. Shared across features
// (auth + tour-operator forms). The paired select renderer is AppSelectField.
export const AppField = ({
	field,
	label,
	type = "text",
	description,
	autoComplete,
}: AppFieldProps) => {
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;
	return (
		<Field data-invalid={isInvalid || undefined}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Input
				id={field.name}
				name={field.name}
				type={type}
				value={field.state.value}
				onChange={(e) => field.handleChange(e.target.value)}
				onBlur={field.handleBlur}
				aria-invalid={isInvalid}
				autoComplete={autoComplete}
			/>
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};
