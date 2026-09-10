import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import * as m from "#/paraglide/messages";
import { AppNumericInput } from "#/shared/components/AppNumericInput";
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
				<Select
					value={value || undefined}
					onValueChange={(v) => onValueChange(v === "unset" ? "" : v)}
				>
					<SelectTrigger id={inputId} className="w-full">
						<SelectValue placeholder={m.not_set()} />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="unset">{m.not_set()}</SelectItem>
							<SelectItem value="true">{m.value_true()}</SelectItem>
							<SelectItem value="false">{m.value_false()}</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			);
		case "date":
			return (
				<Input
					id={inputId}
					type="date"
					value={value}
					onChange={(e) => onValueChange(e.target.value)}
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
				<Textarea
					id={inputId}
					rows={3}
					value={value}
					onChange={(e) => onValueChange(e.target.value)}
				/>
			);
		case "json":
			return (
				<Textarea
					id={inputId}
					rows={4}
					className="font-mono text-xs"
					value={value}
					onChange={(e) => onValueChange(e.target.value)}
				/>
			);
		case "url":
			return (
				<Input
					id={inputId}
					value={value}
					placeholder="https://"
					onChange={(e) => onValueChange(e.target.value)}
				/>
			);
		default:
			return (
				<Input
					id={inputId}
					value={value}
					onChange={(e) => onValueChange(e.target.value)}
				/>
			);
	}
};
