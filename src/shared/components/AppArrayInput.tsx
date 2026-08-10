import type { AnyFieldApi } from "@tanstack/react-form";
import { X } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import * as m from "#/paraglide/messages";
import { AppBadge } from "./AppBadge";
import { RequiredMark } from "./RequiredMark";

interface AppArrayInputProps {
	field: AnyFieldApi;
	label: string;
	description?: string;
	placeholder?: string;
	required?: boolean;
}

// Trims and de-dupes on add. Backspace on an empty input removes the last chip.
export const AppArrayInput = ({
	field,
	label,
	description,
	placeholder,
	required,
}: AppArrayInputProps) => {
	const [text, setText] = useState("");
	const items = (field.state.value ?? []) as string[];
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;

	const add = () => {
		const trimmed = text.trim();
		setText("");
		if (!trimmed || items.includes(trimmed)) return;
		field.handleChange([...items, trimmed]);
	};

	const remove = (item: string) => {
		field.handleChange(items.filter((v) => v !== item));
	};

	const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			add();
		} else if (e.key === "Backspace" && !text && items.length > 0) {
			remove(items[items.length - 1]);
		}
	};

	return (
		<Field data-invalid={isInvalid || undefined}>
			<FieldLabel htmlFor={field.name}>
				{label}
				{required && <RequiredMark />}
			</FieldLabel>
			<div className="flex flex-col gap-2">
				{items.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{items.map((item) => (
							<AppBadge key={item} variant="secondary" className="gap-1">
								{item}
								<button
									type="button"
									onClick={() => remove(item)}
									className="cursor-pointer hover:text-foreground"
									aria-label={m.remove_item({ item })}
								>
									<X className="size-3" />
								</button>
							</AppBadge>
						))}
					</div>
				)}
				<Input
					id={field.name}
					name={field.name}
					type="text"
					autoComplete="off"
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={onKeyDown}
					onBlur={field.handleBlur}
					aria-invalid={isInvalid}
					aria-required={required || undefined}
					placeholder={placeholder ?? m.type_and_press_enter()}
				/>
			</div>
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};
