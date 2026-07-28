import { Card, CardContent } from "#/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import { AppTypedValueInput, metafieldTypeLabel } from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { useMetaobjectForm } from "../hooks/use-metaobject-form";
import type { Metaobject, MetaobjectDefinition } from "../types";
import { deriveSlug } from "../validators/metaobject";

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

	return (
		<Card>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					{errorMessage && (
						<AppAlert title={m.error()} description={errorMessage} />
					)}
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
							<form.Field
								key={defField.key}
								name={`values.${defField.key}` as "values"}
							>
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
											value={(field.state.value as unknown as string) ?? ""}
											onValueChange={(v) => field.handleChange(v as never)}
										/>
									</Field>
								)}
							</form.Field>
						))}
					</FieldGroup>
					<AppFormActions
						isPending={isPending}
						submitLabel={isEdit ? m.save_changes() : m.create()}
					/>
				</form>
			</CardContent>
		</Card>
	);
};
