import type { AnyFieldApi } from "@tanstack/react-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { cn } from "#/lib/utils";
import { RequiredMark } from "./RequiredMark";

interface AppColorFieldProps {
	field: AnyFieldApi;
	label: string;
	description?: string;
	required?: boolean;
	hideLabel?: boolean;
}

const SWATCH = "size-9 shrink-0 cursor-pointer rounded-md border border-border";

export const AppColorField = ({
	field,
	label,
	description,
	required,
	hideLabel,
}: AppColorFieldProps) => {
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;
	const value = (field.state.value as string) ?? "";
	const swatchValue = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";

	return (
		<Field data-invalid={isInvalid || undefined}>
			<FieldLabel
				htmlFor={field.name}
				className={hideLabel ? "sr-only" : undefined}
			>
				{label}
				{required && <RequiredMark />}
			</FieldLabel>
			<div className="flex items-center gap-2">
				<input
					type="color"
					aria-label={label}
					value={swatchValue}
					onChange={(e) => field.handleChange(e.target.value.toLowerCase())}
					onBlur={field.handleBlur}
					className={cn(SWATCH, "appearance-none bg-transparent p-0")}
				/>
				<Input
					id={field.name}
					name={field.name}
					value={value}
					onChange={(e) => field.handleChange(e.target.value.toLowerCase())}
					onBlur={field.handleBlur}
					aria-invalid={isInvalid}
					aria-required={required || undefined}
					placeholder="#0b3d5c"
					spellCheck={false}
					className="font-mono"
				/>
			</div>
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};
