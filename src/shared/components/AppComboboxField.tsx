import type { AnyFieldApi } from "@tanstack/react-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "#/components/ui/command";
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

export interface ComboboxItem {
	value: string;
	label: string;
}

interface AppComboboxFieldProps {
	field: AnyFieldApi;
	label: string;
	/** The whole list. Filtering is client-side — see the note below. */
	items: readonly ComboboxItem[];
	description?: string;
	placeholder?: string;
	required?: boolean;
}

/**
 * The searchable counterpart to AppSelectField: a Popover over cmdk's Command,
 * for a list too long to scan.
 *
 * **Client-side filtering, deliberately.** The archive's combobox searched
 * server-side — debounced, cursor-paginated, one request per keystroke — which
 * is right for tenant data of unknown size. This one is for a fixed reference
 * list already in the cache with `staleTime: Infinity` (249 countries arrive in
 * one call and never change mid-session), so a round trip per keystroke would
 * buy nothing. Command filters the rendered items itself.
 *
 * Items are keyed by `value` but Command matches on the `value` PROP it is
 * given, so each item passes its LABEL there and the handler closes over the
 * real value — otherwise typing "Spain" would match nothing and typing a UUID
 * would.
 */
export const AppComboboxField = ({
	field,
	label,
	items,
	description,
	placeholder,
	required,
}: AppComboboxFieldProps) => {
	const [open, setOpen] = useState(false);
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;
	const selected = items.find((item) => item.value === field.state.value);

	return (
		<Field data-invalid={isInvalid || undefined}>
			<FieldLabel htmlFor={field.name}>
				{label}
				{required && <RequiredMark />}
			</FieldLabel>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						id={field.name}
						variant="outline"
						role="combobox"
						aria-expanded={open}
						aria-invalid={isInvalid || undefined}
						onBlur={field.handleBlur}
						className={cn(
							"w-full justify-between font-normal",
							!selected && "text-muted-foreground",
						)}
					>
						<span className="truncate">
							{selected?.label ?? placeholder ?? m.select_option()}
						</span>
						<ChevronsUpDown className="size-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-[var(--radix-popover-trigger-width)] p-0"
					align="start"
				>
					<Command>
						<CommandInput placeholder={m.search()} />
						<CommandList>
							<CommandEmpty>{m.no_results()}</CommandEmpty>
							<CommandGroup>
								{items.map((item) => (
									<CommandItem
										key={item.value}
										value={item.label}
										onSelect={() => {
											field.handleChange(item.value);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"size-4",
												item.value === field.state.value
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										{item.label}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};
