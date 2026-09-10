import type { HeaderContext } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import * as m from "#/paraglide/messages";
import { AppFilterInput } from "./AppFilterInput";

type TextOperator =
	| "eq"
	| "neq"
	| "contains"
	| "not_contains"
	| "starts_with"
	| "ends_with";

interface TextFilterValue {
	operator: TextOperator;
	value: string;
}

const OPERATORS: TextOperator[] = [
	"contains",
	"not_contains",
	"eq",
	"neq",
	"starts_with",
	"ends_with",
];

const operatorLabel = (op: TextOperator): string => {
	switch (op) {
		case "eq":
			return m.op_eq();
		case "neq":
			return m.op_neq();
		case "contains":
			return m.op_contains();
		case "not_contains":
			return m.op_not_contains();
		case "starts_with":
			return m.op_starts_with();
		case "ends_with":
			return m.op_ends_with();
	}
};

export function AppTextFilter<TData>({
	headerContext,
}: {
	headerContext: HeaderContext<TData, unknown>;
}) {
	const { column } = headerContext;
	const current = column.getFilterValue() as TextFilterValue | undefined;

	const [op, setOp] = useState<TextOperator>(current?.operator ?? "contains");
	const [text, setText] = useState(current?.value ?? "");
	const [debouncedText, setDebouncedText] = useState(text);

	useEffect(() => {
		const id = setTimeout(() => setDebouncedText(text), 400);
		return () => clearTimeout(id);
	}, [text]);

	useEffect(() => {
		const next: TextFilterValue | undefined = debouncedText
			? { operator: op, value: debouncedText }
			: undefined;
		const prev = column.getFilterValue() as TextFilterValue | undefined;
		if (prev?.value === next?.value && prev?.operator === next?.operator) {
			return;
		}
		column.setFilterValue(next);
	}, [debouncedText, op, column]);

	return (
		<div className="flex w-full flex-col gap-1.5">
			<Select value={op} onValueChange={(v) => setOp(v as TextOperator)}>
				<SelectTrigger size="sm" className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{OPERATORS.map((o) => (
							<SelectItem key={o} value={o}>
								{operatorLabel(o)}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<AppFilterInput
				placeholder={m.search()}
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>
		</div>
	);
}
