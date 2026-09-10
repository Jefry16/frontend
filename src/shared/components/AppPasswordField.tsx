import type { AnyFieldApi } from "@tanstack/react-form";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import * as m from "#/paraglide/messages";

interface AppPasswordFieldProps {
	field: AnyFieldApi;
	label: string;
	description?: string;
	autoComplete?: string;
}

export const AppPasswordField = ({
	field,
	label,
	description,
	autoComplete,
}: AppPasswordFieldProps) => {
	const [show, setShow] = useState(false);
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;
	return (
		<Field data-invalid={isInvalid || undefined}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<div className="relative">
				<Input
					id={field.name}
					name={field.name}
					type={show ? "text" : "password"}
					value={field.state.value}
					onChange={(e) => field.handleChange(e.target.value)}
					onBlur={field.handleBlur}
					aria-invalid={isInvalid}
					autoComplete={autoComplete}
					className="pr-10"
				/>
				<button
					type="button"
					onClick={() => setShow((s) => !s)}
					tabIndex={-1}
					aria-label={show ? m.hide_password() : m.show_password()}
					className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
				>
					{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
				</button>
			</div>
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};
