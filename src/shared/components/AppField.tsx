import type { AnyFieldApi } from "@tanstack/react-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { RequiredMark } from "./RequiredMark";

interface AppFieldProps {
	field: AnyFieldApi;
	label: string;
	type?: "text" | "email" | "password";
	description?: string;
	placeholder?: string;
	autoComplete?: string;
	required?: boolean;
	hideLabel?: boolean;
}

export const AppField = ({
	field,
	label,
	type = "text",
	description,
	placeholder,
	autoComplete,
	required,
	hideLabel,
}: AppFieldProps) => {
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;
	return (
		<Field data-invalid={isInvalid || undefined}>
			<FieldLabel
				htmlFor={field.name}
				className={hideLabel ? "sr-only" : undefined}
			>
				{label}
				{required && <RequiredMark />}
			</FieldLabel>
			<Input
				id={field.name}
				name={field.name}
				type={type}
				value={field.state.value}
				onChange={(e) => field.handleChange(e.target.value)}
				onBlur={field.handleBlur}
				aria-invalid={isInvalid}
				aria-required={required || undefined}
				placeholder={placeholder}
				autoComplete={autoComplete}
			/>
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};
