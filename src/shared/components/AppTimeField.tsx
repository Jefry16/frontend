import type { AnyFieldApi } from "@tanstack/react-form";
import { Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { cn } from "#/lib/utils";
import { useUiLabels } from "../labels";
import { RequiredMark } from "./RequiredMark";

interface AppTimeFieldProps {
	field: AnyFieldApi;
	label: string;
	description?: string;
	placeholder?: string;
	required?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const GRID_MINUTES = Array.from({ length: 12 }, (_, i) =>
	String(i * 5).padStart(2, "0"),
);

const displayTime = (time: string): string | null => {
	if (!time) return null;
	const [h, mn] = time.split(":").map(Number);
	if (Number.isNaN(h) || Number.isNaN(mn)) return null;
	return new Intl.DateTimeFormat(undefined, {
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(2024, 0, 1, h ?? 0, mn ?? 0));
};

export const AppTimeField = ({
	field,
	label,
	description,
	placeholder,
	required,
}: AppTimeFieldProps) => {
	const labels = useUiLabels();
	const [open, setOpen] = useState(false);
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;

	const value = field.state.value as string;
	const [hour = "", minute = ""] = (value || ":").split(":");
	const display = displayTime(value);
	const minutes = GRID_MINUTES.includes(minute)
		? GRID_MINUTES
		: minute
			? [...GRID_MINUTES, minute].sort()
			: GRID_MINUTES;

	const update = (h: string, mn: string) => {
		field.handleChange(`${h || "00"}:${mn || "00"}`);
	};

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
						<Clock />
						{display ?? placeholder ?? labels.pickATime}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-2" align="start">
					<div className="flex items-center gap-2">
						<Select value={hour} onValueChange={(h) => update(h, minute)}>
							<SelectTrigger
								size="sm"
								className="w-20"
								aria-label={labels.hour}
							>
								<SelectValue placeholder="HH" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{HOURS.map((h) => (
										<SelectItem key={h} value={h}>
											{h}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						<span className="text-muted-foreground">:</span>
						<Select value={minute} onValueChange={(mn) => update(hour, mn)}>
							<SelectTrigger
								size="sm"
								className="w-20"
								aria-label={labels.minute}
							>
								<SelectValue placeholder="MM" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{minutes.map((mn) => (
										<SelectItem key={mn} value={mn}>
											{mn}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</PopoverContent>
			</Popover>
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};
