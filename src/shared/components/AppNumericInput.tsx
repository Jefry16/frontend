import type { ComponentProps } from "react";
import { Input } from "#/components/ui/input";

const INTEGER_INPUT = /^\d*$/;
const DECIMAL_INPUT = /^\d*\.?\d*$/;

// The chrome-less gated numeric input: a text input that only accepts digits
// (and, with `decimal`, one point), reporting the raw string via
// `onValueChange` — the consumer's schema does the Number transform + bounds.
// A gated text input beats type="number" (no scroll-wheel edits, no "e"/"+"
// surprises). AppNumberField adds the Field chrome on top; dialogs and array
// rows use this directly.
export const AppNumericInput = ({
	decimal,
	onValueChange,
	...props
}: Omit<ComponentProps<typeof Input>, "type" | "inputMode" | "onChange"> & {
	/** Allow a decimal point (prices); default integers only (counts). */
	decimal?: boolean;
	onValueChange: (value: string) => void;
}) => (
	<Input
		type="text"
		inputMode={decimal ? "decimal" : "numeric"}
		autoComplete="off"
		onChange={(e) => {
			if ((decimal ? DECIMAL_INPUT : INTEGER_INPUT).test(e.target.value)) {
				onValueChange(e.target.value);
			}
		}}
		{...props}
	/>
);
