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
import * as m from "#/paraglide/messages";
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

/** "14:30" → locale display ("2:30 PM" / "14:30"); null when not a valid time. */
const displayTime = (time: string): string | null => {
	if (!time) return null;
	const [h, mn] = time.split(":").map(Number);
	if (Number.isNaN(h) || Number.isNaN(mn)) return null;
	return new Intl.DateTimeFormat(undefined, {
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(2024, 0, 1, h ?? 0, mn ?? 0));
};

// The time-of-day field: a Clock button opening an hour + minute picker, bound
// to a TanStack Form field holding "HH:mm". Minutes offer 5-minute steps, but an
// existing off-grid value (e.g. "09:37") is kept in the list so editing never
// silently misrepresents it. The trigger shows the locale's own time format;
// the stored value stays 24h "HH:mm" (what the backend parses). Closing the
// popover blurs the field so touched-state validation fires.
export const AppTimeField = ({
	field,
	label,
	description,
	placeholder,
	required,
}: AppTimeFieldProps) => {
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
						{display ?? placeholder ?? m.pick_a_time()}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-2" align="start">
					<div className="flex items-center gap-2">
						<Select value={hour} onValueChange={(h) => update(h, minute)}>
							<SelectTrigger size="sm" className="w-20" aria-label={m.hour()}>
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
							<SelectTrigger size="sm" className="w-20" aria-label={m.minute()}>
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
