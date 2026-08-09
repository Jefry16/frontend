import type { AnyFieldApi } from "@tanstack/react-form";
import { CalendarIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { Button } from "#/components/ui/button";
import { Calendar } from "#/components/ui/calendar";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "#/components/ui/field";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { cn } from "#/lib/utils";
import * as m from "#/paraglide/messages";
import { RequiredMark } from "./RequiredMark";

interface AppDateFieldProps {
	field: AnyFieldApi;
	label: string;
	description?: string;
	placeholder?: string;
	required?: boolean;
	/** A react-day-picker Matcher, e.g. `{ before: operatorToday }`. */
	disabledDates?: ComponentProps<typeof Calendar>["disabled"];
}

/** Undefined when absent or malformed. */
const parseIso = (value: string): Date | undefined => {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return undefined;
	return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const toIso = (date: Date): string =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// The field value is an ISO "YYYY-MM-DD" string, which is what the backend
// parses; the trigger shows the viewer's locale format. Selecting blurs the
// field, so touched-state validation fires. No date library.
export const AppDateField = ({
	field,
	label,
	description,
	placeholder,
	required,
	disabledDates,
}: AppDateFieldProps) => {
	const [open, setOpen] = useState(false);
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;

	const date = parseIso(field.state.value as string);
	const display = date
		? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date)
		: null;

	return (
		<Field data-invalid={isInvalid || undefined}>
			<FieldLabel htmlFor={field.name}>
				{label}
				{required && <RequiredMark />}
			</FieldLabel>
			<Popover
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (!next) field.handleBlur();
				}}
			>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="outline"
						id={field.name}
						className={cn(
							"w-full cursor-pointer justify-start bg-card text-left font-normal",
							!display && "text-muted-foreground",
						)}
						aria-invalid={isInvalid}
						aria-required={required || undefined}
					>
						<CalendarIcon />
						{display ?? placeholder ?? m.pick_a_date()}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={date}
						// DayPicker opens on today's month otherwise, even with a selection.
						defaultMonth={date}
						disabled={disabledDates}
						onSelect={(d) => {
							field.handleChange(d ? toIso(d) : "");
							setOpen(false);
						}}
					/>
				</PopoverContent>
			</Popover>
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};
