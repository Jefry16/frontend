import type { AnyFieldApi } from "@tanstack/react-form";
import { Checkbox } from "#/components/ui/checkbox";
import {
	FieldDescription,
	FieldError,
	FieldLegend,
	FieldSet,
} from "#/components/ui/field";
import { Label } from "#/components/ui/label";
import { cn } from "#/lib/utils";
import { RequiredMark } from "./RequiredMark";

interface Option<T> {
	value: T;
	label: string;
}

interface Props<T extends string | number> {
	field: AnyFieldApi;
	label: string;
	options: Option<T>[];
	description?: string;
	required?: boolean;
	layout?: "wrap" | "grid";
	onChanged?: (next: T[]) => void;
}

export function AppCheckboxGroupField<T extends string | number>({
	field,
	label,
	options,
	description,
	required,
	layout = "wrap",
	onChanged,
}: Props<T>) {
	const selected = (field.state.value ?? []) as T[];
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;

	const toggle = (value: T, checked: boolean) => {
		const next = checked
			? [...selected, value].sort((a, b) =>
					typeof a === "number" && typeof b === "number"
						? a - b
						: String(a).localeCompare(String(b)),
				)
			: selected.filter((v) => v !== value);
		field.handleChange(next);
		field.handleBlur();
		onChanged?.(next);
	};

	return (
		<FieldSet data-invalid={isInvalid || undefined}>
			<FieldLegend variant="label">
				{label}
				{required && <RequiredMark />}
			</FieldLegend>
			{description && <FieldDescription>{description}</FieldDescription>}
			<div
				className={cn(
					"pt-1",
					layout === "grid"
						? "grid grid-cols-2 gap-2 sm:grid-cols-3"
						: "flex flex-wrap gap-x-4 gap-y-2",
				)}
			>
				{options.map((option) => {
					const id = `${field.name}-${option.value}`;
					return (
						<div key={option.value} className="flex items-center gap-2">
							<Checkbox
								id={id}
								checked={selected.includes(option.value)}
								onCheckedChange={(checked) =>
									toggle(option.value, checked === true)
								}
							/>
							<Label htmlFor={id} className="font-normal">
								{option.label}
							</Label>
						</div>
					);
				})}
			</div>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</FieldSet>
	);
}
