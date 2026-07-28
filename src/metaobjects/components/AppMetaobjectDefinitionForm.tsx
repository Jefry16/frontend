import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	METAFIELD_TYPE_CODES,
	type MetafieldTypeCode,
	metafieldTypeLabel,
} from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { useMetaobjectDefinitionForm } from "../hooks/use-metaobject-definition-form";
import type { MetaobjectDefinition, MetaobjectField } from "../types";
import { deriveSlug, fieldSchema } from "../validators/metaobject";

interface FieldRow extends MetaobjectField {
	/** Local row identity — keys are editable, so they can't key the list. */
	rowId: number;
}

// The definition form — create (no `definition`: type + name + description +
// the initial field rows; a blurred name prefills an empty type slug) or edit
// (name/description only — the type is immutable and the field set is managed
// on the detail page).
export const AppMetaobjectDefinitionForm = ({
	tourOperatorId,
	definition,
}: {
	tourOperatorId: string;
	definition?: MetaobjectDefinition;
}) => {
	const { form, mutate, isPending, errorMessage, isEdit } =
		useMetaobjectDefinitionForm(tourOperatorId, definition);
	const [rows, setRows] = useState<FieldRow[]>([
		{ rowId: 1, key: "", type: "single_line_text", name: "" },
	]);
	const [rowsError, setRowsError] = useState<string | null>(null);

	const updateRow = (rowId: number, patch: Partial<MetaobjectField>) =>
		setRows((prev) =>
			prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)),
		);

	const submit = async () => {
		await form.handleSubmit();
		if (!form.state.isValid) return;
		if (isEdit) {
			mutate({ ...form.state.values, fields: [] });
			return;
		}
		// Validate the field rows: every row complete + slug-shaped, keys unique.
		const seen = new Set<string>();
		for (const row of rows) {
			const parsed = fieldSchema.safeParse(row);
			if (!parsed.success) {
				setRowsError(m.metaobject_fields_incomplete());
				return;
			}
			if (seen.has(parsed.data.key)) {
				setRowsError(m.metaobject_fields_duplicate_key());
				return;
			}
			seen.add(parsed.data.key);
		}
		setRowsError(null);
		mutate({
			...form.state.values,
			fields: rows.map(({ key, type, name }) => ({ key, type, name })),
		});
	};

	return (
		<Card>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						submit();
					}}
					className="space-y-4"
				>
					{(errorMessage || rowsError) && (
						<AppAlert
							title={m.error()}
							description={errorMessage ?? rowsError ?? ""}
						/>
					)}
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
						<div className="flex flex-col gap-3">
							<FieldLabel>{m.metaobject_fields()}</FieldLabel>
							{rows.map((row) => (
								<div key={row.rowId} className="flex items-start gap-2">
									<Input
										aria-label={m.name()}
										placeholder={m.name()}
										value={row.name}
										onChange={(e) =>
											updateRow(row.rowId, { name: e.target.value })
										}
										onBlur={() => {
											if (!row.key) {
												updateRow(row.rowId, { key: deriveSlug(row.name) });
											}
										}}
									/>
									<Input
										aria-label={m.metafield_key()}
										placeholder={m.metafield_key()}
										className="font-mono"
										value={row.key}
										onChange={(e) =>
											updateRow(row.rowId, { key: e.target.value })
										}
									/>
									<Select
										value={row.type}
										onValueChange={(v) =>
											updateRow(row.rowId, { type: v as MetafieldTypeCode })
										}
									>
										<SelectTrigger
											className="w-52 shrink-0"
											aria-label={m.metafield_type()}
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{METAFIELD_TYPE_CODES.map((code) => (
													<SelectItem key={code} value={code}>
														{metafieldTypeLabel(code)}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										aria-label={m.remove()}
										disabled={rows.length === 1}
										onClick={() =>
											setRows((prev) =>
												prev.filter((r) => r.rowId !== row.rowId),
											)
										}
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
										setRows((prev) => [
											...prev,
											{
												rowId: Math.max(...prev.map((r) => r.rowId)) + 1,
												key: "",
												type: "single_line_text",
												name: "",
											},
										])
									}
								>
									<Plus />
									{m.metaobject_add_field()}
								</Button>
							</div>
						</div>
					)}

					<AppFormActions
						isPending={isPending}
						submitLabel={isEdit ? m.save_changes() : m.create()}
					/>
				</form>
			</CardContent>
		</Card>
	);
};
