import {
	AppField,
	AppFormActions,
	AppFormCard,
	AppSelectField,
	Button,
	FieldGroup,
	FieldLabel,
	SelectItem,
} from "@vointika/ui";
import { Plus, Trash2 } from "lucide-react";
import { METAOBJECT_FIELD_TYPE_CODES, metafieldTypeLabel } from "#/metafields";
import * as m from "#/paraglide/messages";
import { useMetaobjectDefinitionForm } from "../hooks/use-metaobject-definition-form";
import type { MetaobjectDefinition } from "../types";
import { deriveSlug } from "../validators/metaobject";

export const AppMetaobjectDefinitionForm = ({
	tourOperatorId,
	definition,
}: {
	tourOperatorId: string;
	definition?: MetaobjectDefinition;
}) => {
	const { form, isPending, errorMessage, isEdit } = useMetaobjectDefinitionForm(
		tourOperatorId,
		definition,
	);

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
							if (!isEdit && !form.getFieldValue("type")) {
								form.setFieldValue(
									"type",
									deriveSlug(form.getFieldValue("name")),
								);
							}
						},
					}}
				>
					{(field) => <AppField field={field} label={m.name()} required />}
				</form.Field>
				{!isEdit && (
					<form.Field name="type">
						{(field) => (
							<AppField
								field={field}
								label={m.metaobject_type()}
								description={m.metaobject_type_field_hint()}
								required
							/>
						)}
					</form.Field>
				)}
				<form.Field name="description">
					{(field) => <AppField field={field} label={m.description()} />}
				</form.Field>
			</FieldGroup>

			{!isEdit && (
				<form.Field name="fields" mode="array">
					{(fieldsField) => (
						<div className="flex flex-col gap-3">
							<FieldLabel>{m.metaobject_fields()}</FieldLabel>
							{(fieldsField.state.value ?? []).map((_, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: see above
								<div key={index} className="flex items-start gap-2">
									<form.Field
										name={`fields[${index}].name`}
										listeners={{
											onBlur: () => {
												if (!form.getFieldValue(`fields[${index}].key`)) {
													form.setFieldValue(
														`fields[${index}].key`,
														deriveSlug(
															form.getFieldValue(`fields[${index}].name`),
														),
													);
												}
											},
										}}
									>
										{(field) => (
											<AppField
												field={field}
												label={m.name()}
												hideLabel
												placeholder={m.name()}
											/>
										)}
									</form.Field>
									<form.Field name={`fields[${index}].key`}>
										{(field) => (
											<AppField
												field={field}
												label={m.metafield_key()}
												hideLabel
												placeholder={m.metafield_key()}
											/>
										)}
									</form.Field>
									<div className="w-52 shrink-0">
										<form.Field name={`fields[${index}].type`}>
											{(field) => (
												<AppSelectField
													field={field}
													label={m.metafield_type()}
													hideLabel
												>
													{METAOBJECT_FIELD_TYPE_CODES.map((code) => (
														<SelectItem key={code} value={code}>
															{metafieldTypeLabel(code)}
														</SelectItem>
													))}
												</AppSelectField>
											)}
										</form.Field>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										aria-label={m.remove()}
										disabled={fieldsField.state.value.length === 1}
										onClick={() => fieldsField.removeValue(index)}
									>
										<Trash2 />
									</Button>
								</div>
							))}
							<div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() =>
										fieldsField.pushValue({
											key: "",
											type: "single_line_text",
											name: "",
										})
									}
								>
									<Plus />
									{m.metaobject_add_field()}
								</Button>
							</div>
						</div>
					)}
				</form.Field>
			)}
		</AppFormCard>
	);
};
