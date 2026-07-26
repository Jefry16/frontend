import type { AnyFieldApi } from "@tanstack/react-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
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

const INTEGER_INPUT = /^\d*$/;
const DECIMAL_INPUT = /^\d*\.?\d*$/;

// The numeric sibling of AppField: a text input that only accepts digits (and
// optionally one decimal point), bound to a TanStack Form field holding the raw
// string — the zod schema does the Number transform + bounds. A gated text
// input beats type="number" (no scroll-wheel edits, no "e"/"+" surprises).
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
	const allowed = decimal ? DECIMAL_INPUT : INTEGER_INPUT;

	return (
		<Field data-invalid={isInvalid || undefined}>
			<FieldLabel htmlFor={field.name}>
				{label}
				{required && <RequiredMark />}
			</FieldLabel>
			<Input
				id={field.name}
				name={field.name}
				type="text"
				inputMode={decimal ? "decimal" : "numeric"}
				autoComplete="off"
				value={field.state.value}
				onChange={(e) => {
					if (allowed.test(e.target.value)) {
						field.handleChange(e.target.value);
					}
				}}
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
