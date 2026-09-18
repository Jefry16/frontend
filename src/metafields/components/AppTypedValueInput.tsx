import {
	AppDatePicker,
	AppNumericInput,
	AppSelect,
	AppTextarea,
	AppTextInput,
	SelectItem,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import type { MetafieldTypeCode } from "../types";

export const AppTypedValueInput = ({
	inputId,
	type,
	value,
	onValueChange,
}: {
	inputId: string;
	type: MetafieldTypeCode;
	value: string;
	onValueChange: (value: string) => void;
}) => {
	switch (type) {
		case "boolean":
			return (
				<AppSelect
					id={inputId}
					value={value}
					onValueChange={(v) => onValueChange(v === "unset" ? "" : v)}
					placeholder={m.not_set()}
				>
					<SelectItem value="unset">{m.not_set()}</SelectItem>
					<SelectItem value="true">{m.value_true()}</SelectItem>
					<SelectItem value="false">{m.value_false()}</SelectItem>
				</AppSelect>
			);
		case "date":
			return (
				<AppDatePicker
					id={inputId}
					value={value}
					onValueChange={onValueChange}
					placeholder={m.not_set()}
				/>
			);
		case "number_integer":
		case "number_decimal":
			return (
				<AppNumericInput
					id={inputId}
					decimal={type === "number_decimal"}
					value={value}
					onValueChange={onValueChange}
				/>
			);
		case "multi_line_text":
			return (
				<AppTextarea id={inputId} value={value} onValueChange={onValueChange} />
			);
		case "json":
			return (
				<AppTextarea
					id={inputId}
					rows={4}
					className="font-mono text-xs"
					value={value}
					onValueChange={onValueChange}
				/>
			);
		case "url":
			return (
				<AppTextInput
					id={inputId}
					value={value}
					placeholder="https://"
					onValueChange={onValueChange}
				/>
			);
		default:
			return (
				<AppTextInput
					id={inputId}
					value={value}
					onValueChange={onValueChange}
				/>
			);
	}
};
