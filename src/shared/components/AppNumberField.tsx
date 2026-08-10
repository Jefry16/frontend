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
	/** Prices need one; counts do not. */
	decimal?: boolean;
}

// The field holds the RAW STRING; the zod schema does the Number transform.
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
