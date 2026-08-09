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
	/** `SelectItem` children. */
	children: ReactNode;
	placeholder?: string;
	description?: string;
	/**
	 * For a cell in a repeating row: a visible label on every row is noise, but
	 * the control still needs a programmatic name — a placeholder is not one.
	 */
	hideLabel?: boolean;
	/** For a pick that invalidates sibling fields. */
	onValueChange?: (value: string) => void;
}

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
