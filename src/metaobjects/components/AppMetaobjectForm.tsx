import type { ReactNode } from "react";
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import { AppTypedValueInput, metafieldTypeLabel } from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { useMetaobjectForm } from "../hooks/use-metaobject-form";
import type { Metaobject, MetaobjectDefinition } from "../types";
import { deriveSlug } from "../validators/metaobject";

/**
 * TanStack proves a field path against the value type, and `values` is a
 * `Record<string, string>` whose keys arrive from the definition at runtime —
 * so `values.<key>` is not in the union it can prove.
 *
 * Addressed through this structural view, cast once where the form mounts, the
 * way AppMenuItemsEditor handles its recursive tree. It was three casts at the
 * point of use before: `as "values"` on the path, which then made the field
 * look like the whole record, so the value and the setter each needed undoing
 * again (`as unknown as string`, `as never`). The runtime path was right the
 * whole time — only the compiler was being lied to, three times.
 *
 * The value is typed rather than left as `AnyFieldApi`: the record holds
 * strings and AppTypedValueInput wants a string, so saying so is what makes the
 * casts unnecessary instead of merely hidden. handle/name keep their real types.
 */
interface ValuesForm {
	Field: (props: {
		name: string;
		children: (field: {
			// `string | undefined`, not `string`: this is an index into a record
			// keyed at runtime. The defaults build a key per definition field, so it
			// should always be present — but "should" is not a thing to type, and
			// the `?? ""` below is what the casts used to sit in front of.
			state: { value: string | undefined };
			handleChange: (value: string) => void;
		}) => ReactNode;
	}) => ReactNode;
}

// The entry form, GENERATED from the definition: name + handle (a blurred
// name prefills an empty handle) + one type-aware input per field. Create
// (no `entry`) or edit (with one — blanked fields clear on save). Value
// validation is the backend's (per-field 422 surfaces in the alert).
export const AppMetaobjectForm = ({
	tourOperatorId,
	definition,
	entry,
}: {
	tourOperatorId: string;
	definition: MetaobjectDefinition;
	entry?: Metaobject;
}) => {
	const { form, isPending, errorMessage, isEdit } = useMetaobjectForm(
		tourOperatorId,
		definition,
		entry,
	);
	const values = form as unknown as ValuesForm;

	return (
		<AppFormCard
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			actions={
				<AppFormActions
					isPending={isPending}
					submitLabel={isEdit ? m.save_changes() : m.create()}
				/>
			}
		>
			<FieldGroup>
				<form.Field
					name="name"
					listeners={{
						onBlur: () => {
							if (!isEdit && !form.getFieldValue("handle")) {
								form.setFieldValue(
									"handle",
									deriveSlug(form.getFieldValue("name")),
								);
							}
						},
					}}
				>
					{(field) => <AppField field={field} label={m.name()} required />}
				</form.Field>
				<form.Field name="handle">
					{(field) => (
						<AppField
							field={field}
							label={m.handle()}
							description={m.metaobject_handle_hint()}
							required
						/>
					)}
				</form.Field>
				{definition.fields.map((defField) => (
					<values.Field key={defField.key} name={`values.${defField.key}`}>
						{(field) => (
							<Field>
								<FieldLabel htmlFor={`metaobject-${defField.key}`}>
									{defField.name}
									<span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
										{metafieldTypeLabel(defField.type)}
									</span>
								</FieldLabel>
								<AppTypedValueInput
									inputId={`metaobject-${defField.key}`}
									type={defField.type}
									value={field.state.value ?? ""}
									onValueChange={field.handleChange}
								/>
							</Field>
						)}
					</values.Field>
				))}
			</FieldGroup>
		</AppFormCard>
	);
};
