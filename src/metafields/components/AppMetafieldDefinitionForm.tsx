import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { SelectItem } from "#/components/ui/select";
import { useAllPages } from "#/hooks/use-all-pages";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppSelectField } from "#/shared/components/AppSelectField";
import { ownerTypeLabel, TYPE_CODES, typeLabel } from "../format";
import { useMetafieldDefinitionForm } from "../hooks/use-metafield-definition-form";
import type { MetafieldDefinition } from "../types";
import { deriveKey } from "../validators/definition";

// The definition form — create (no `definition`) or edit (with one). The
// identity (applies-to, type, namespace, key) is immutable, so the edit form
// shows it as a mono line and only submits name/description. On create, a
// blurred name prefills an empty key with its slug (Shopify's derive), never
// overwriting what the operator typed.
export const AppMetafieldDefinitionForm = ({
	tourOperatorId,
	definition,
}: {
	tourOperatorId: string;
	definition?: MetafieldDefinition;
}) => {
	const { form, isPending, errorMessage, isEdit } = useMetafieldDefinitionForm(
		tourOperatorId,
		definition,
	);
	// The pin select's options — the operator's metaobject types (a bounded
	// catalogue; only rendered once the reference type is chosen).
	const metaobjectTypes = useAllPages<{ id: string; name: string }>(
		queryKeys.metaobjectDefinitions(tourOperatorId),
		`/tour-operators/${tourOperatorId}/metaobject-definitions`,
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
					{isEdit && definition && (
						<p className="text-sm text-muted-foreground">
							{ownerTypeLabel(definition.ownerType)} ·{" "}
							{typeLabel(definition.type)} ·{" "}
							<span className="font-mono">
								{definition.namespace}.{definition.key}
							</span>
						</p>
					)}
					<FieldGroup>
						{!isEdit && (
							<>
								<form.Field name="ownerType">
									{(field) => (
										<AppSelectField
											field={field}
											label={m.metafield_applies_to()}
										>
											<SelectItem value="experience">
												{ownerTypeLabel("experience")}
											</SelectItem>
											<SelectItem value="page">
												{ownerTypeLabel("page")}
											</SelectItem>
										</AppSelectField>
									)}
								</form.Field>
								<form.Field name="type">
									{(field) => (
										<AppSelectField
											field={field}
											label={m.metafield_type()}
											description={m.metafield_type_hint()}
										>
											{TYPE_CODES.map((code) => (
												<SelectItem key={code} value={code}>
													{typeLabel(code)}
												</SelectItem>
											))}
										</AppSelectField>
									)}
								</form.Field>
								<form.Subscribe selector={(state) => state.values.type}>
									{(type) =>
										type === "metaobject_reference" && (
											<form.Field name="metaobjectDefinitionId">
												{(field) => (
													<AppSelectField
														field={field}
														label={m.metafield_references()}
														description={m.metafield_reference_pin_hint()}
														placeholder={m.metaobject_definition()}
													>
														{metaobjectTypes.rows.map((t) => (
															<SelectItem key={t.id} value={t.id}>
																{t.name}
															</SelectItem>
														))}
													</AppSelectField>
												)}
											</form.Field>
										)
									}
								</form.Subscribe>
							</>
						)}
						<form.Field
							name="name"
							listeners={{
								onBlur: () => {
									if (!isEdit && !form.getFieldValue("key")) {
										form.setFieldValue(
											"key",
											deriveKey(form.getFieldValue("name")),
										);
									}
								},
							}}
						>
							{(field) => <AppField field={field} label={m.name()} required />}
						</form.Field>
						{!isEdit && (
							<>
								<form.Field name="namespace">
									{(field) => (
										<AppField
											field={field}
											label={m.metafield_namespace()}
											description={m.metafield_namespace_hint()}
											required
										/>
									)}
								</form.Field>
								<form.Field name="key">
									{(field) => (
										<AppField
											field={field}
											label={m.metafield_key()}
											description={m.metafield_key_hint()}
											required
										/>
									)}
								</form.Field>
							</>
						)}
						<form.Field name="description">
							{(field) => <AppField field={field} label={m.description()} />}
						</form.Field>
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
