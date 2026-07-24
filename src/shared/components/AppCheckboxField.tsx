import type { AnyFieldApi } from "@tanstack/react-form";
import { Checkbox } from "#/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "#/components/ui/field";

interface AppCheckboxFieldProps {
	field: AnyFieldApi;
	label: string;
	description?: string;
}

// A boolean form field: a checkbox + inline label bound to a TanStack Form field.
export const AppCheckboxField = ({
	field,
	label,
	description,
}: AppCheckboxFieldProps) => (
	<Field>
		<div className="flex items-center gap-2">
			<Checkbox
				id={field.name}
				checked={field.state.value}
				onCheckedChange={(checked) => field.handleChange(checked === true)}
			/>
			<FieldLabel htmlFor={field.name} className="mb-0">
				{label}
			</FieldLabel>
		</div>
		{description && <FieldDescription>{description}</FieldDescription>}
	</Field>
);
