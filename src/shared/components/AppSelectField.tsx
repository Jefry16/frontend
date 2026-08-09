import type { AnyFieldApi } from "@tanstack/react-form";
import type { ReactNode } from "react";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "#/components/ui/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

interface AppSelectFieldProps {
	field: AnyFieldApi;
	label: string;
	/** `SelectItem` children — the options. */
	children: ReactNode;
	placeholder?: string;
	description?: string;
	/**
	 * Render the label for assistive tech only. For a cell in a repeating row,
	 * where a visible label on every row would be noise but the control still
	 * needs a programmatic name — an `aria-label` or a placeholder is not one.
	 */
	hideLabel?: boolean;
	/** Runs after the field changes — for a pick that invalidates sibling fields. */
	onValueChange?: (value: string) => void;
}

// The select counterpart to AppField: a shadcn Select bound to a TanStack Form
// field, with validation errors below. Callers pass `SelectItem`s as children.
export const AppSelectField = ({
	field,
	label,
	children,
	placeholder,
	description,
	hideLabel,
	onValueChange,
}: AppSelectFieldProps) => {
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;
	return (
		<Field data-invalid={isInvalid || undefined}>
			<FieldLabel
				htmlFor={field.name}
				className={hideLabel ? "sr-only" : undefined}
			>
				{label}
			</FieldLabel>
			<Select
				value={field.state.value || undefined}
				onValueChange={(v) => {
					field.handleChange(v);
					onValueChange?.(v);
				}}
			>
				<SelectTrigger
					id={field.name}
					aria-invalid={isInvalid}
					onBlur={field.handleBlur}
					className="w-full"
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{/* SelectGroup carries the item padding (p-1) — without it the
					    items sit flush against the popover edges (shadcn docs pattern). */}
					<SelectGroup>{children}</SelectGroup>
				</SelectContent>
			</Select>
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};
