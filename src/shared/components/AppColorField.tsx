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
	/**
	 * For a cell in a repeating row: a visible label on every row is noise, but
	 * the control still needs a programmatic name — a placeholder is not one.
	 */
	hideLabel?: boolean;
}

// A colour the OPERATOR chose, not one of ours — so the swatch is the only place
// in src/ that sets a colour inline rather than through a token. There is no
// token for it and there cannot be: it is content. See COMPONENTS.md §4.
const SWATCH = "size-9 shrink-0 cursor-pointer rounded-md border border-border";

// Both controls, because neither alone is enough: the native picker is how you
// choose a colour you do not know, and the text box is how you paste the one
// your designer already gave you. They are one field — same value, same errors.
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
	// The picker's own value must always be a valid 6-digit hex or the browser
	// silently shows black; the text box is where a half-typed value lives.
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
					// Lower-cased on the way in, matching what the backend stores — so
					// a pasted #0B3D5C does not read back differently after a save.
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
