import type { AnyFieldApi } from "@tanstack/react-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";

interface AuthFieldProps {
	field: AnyFieldApi;
	label: string;
	type?: "text" | "email" | "password";
	description?: string;
	autoComplete?: string;
}

// The one field renderer the auth forms use: a shadcn Field wrapping an Input
// bound to a TanStack Form field, with the field's validation errors below.
// Kept local to the auth module (the app-wide typed-input framework is not
// ported yet — it returns when a richer feature needs it).
export const AuthField = ({
	field,
	label,
	type = "text",
	description,
	autoComplete,
}: AuthFieldProps) => {
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
