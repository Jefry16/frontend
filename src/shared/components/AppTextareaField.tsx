import type { AnyFieldApi } from "@tanstack/react-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "#/components/ui/field";
import { Textarea } from "#/components/ui/textarea";
import { RequiredMark } from "./RequiredMark";

interface AppTextareaFieldProps {
	field: AnyFieldApi;
	label: string;
	description?: string;
	placeholder?: string;
	rows?: number;
	required?: boolean;
}

// The multi-line sibling of AppField: a shadcn Field wrapping a Textarea bound to
// a TanStack Form field, with validation errors below.
export const AppTextareaField = ({
	field,
	label,
	description,
	placeholder,
	rows = 3,
	required,
}: AppTextareaFieldProps) => {
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;
	return (
		<Field data-invalid={isInvalid || undefined}>
			<FieldLabel htmlFor={field.name}>
				{label}
				{required && <RequiredMark />}
			</FieldLabel>
			<Textarea
				id={field.name}
				name={field.name}
				rows={rows}
				value={field.state.value}
				onChange={(e) => field.handleChange(e.target.value)}
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
