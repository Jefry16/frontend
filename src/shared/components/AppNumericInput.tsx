import type { ComponentProps } from "react";
import { Input } from "#/components/ui/input";

const INTEGER_INPUT = /^\d*$/;
const DECIMAL_INPUT = /^\d*\.?\d*$/;

export const AppNumericInput = ({
	decimal,
	onValueChange,
	...props
}: Omit<ComponentProps<typeof Input>, "type" | "inputMode" | "onChange"> & {
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
