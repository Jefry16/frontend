import type { AnyFieldApi } from "@tanstack/react-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "#/components/ui/field";
import { AppNumericInput } from "./AppNumericInput";
import { RequiredMark } from "./RequiredMark";

interface AppNumberFieldProps {
	field: AnyFieldApi;
	label: string;
	description?: string;
	placeholder?: string;
	required?: boolean;
	/** Allow a decimal point (prices); default integers only (counts). */
	decimal?: boolean;
}

// The numeric sibling of AppField: AppNumericInput's gated input bound to a
// TanStack Form field holding the raw string — the zod schema does the Number
// transform + bounds.
export const AppNumberField = ({
	field,
	label,
	description,
	placeholder,
	required,
	decimal,
}: AppNumberFieldProps) => {
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;

	return (
		<Field data-invalid={isInvalid || undefined}>
			<FieldLabel htmlFor={field.name}>
				{label}
				{required && <RequiredMark />}
			</FieldLabel>
			<AppNumericInput
				id={field.name}
				name={field.name}
				decimal={decimal}
				value={field.state.value}
				onValueChange={field.handleChange}
				onBlur={field.handleBlur}
				aria-invalid={isInvalid}
				aria-required={required || undefined}
				placeholder={placeholder}
			/>
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};
