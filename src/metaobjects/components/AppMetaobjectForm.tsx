import {
	AppField,
	AppFormActions,
	AppFormCard,
	AppLabelledControl,
	FieldGroup,
} from "@vointika/ui";
import type { ReactNode } from "react";
import { AppTypedValueInput, metafieldTypeLabel } from "#/metafields";
import * as m from "#/paraglide/messages";
import { useMetaobjectForm } from "../hooks/use-metaobject-form";
import type { Metaobject, MetaobjectDefinition } from "../types";
import { deriveSlug } from "../validators/metaobject";

interface ValuesForm {
	Field: (props: {
		name: string;
		children: (field: {
			state: { value: string | undefined };
			handleChange: (value: string) => void;
		}) => ReactNode;
	}) => ReactNode;
}

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
							<AppLabelledControl
								label={defField.name}
								hint={metafieldTypeLabel(defField.type)}
								htmlFor={`metaobject-${defField.key}`}
							>
								<AppTypedValueInput
									inputId={`metaobject-${defField.key}`}
									type={defField.type}
									value={field.state.value ?? ""}
									onValueChange={field.handleChange}
								/>
							</AppLabelledControl>
						)}
					</values.Field>
				))}
			</FieldGroup>
		</AppFormCard>
	);
};
