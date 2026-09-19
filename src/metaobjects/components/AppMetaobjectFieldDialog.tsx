import {
	AppAlert,
	AppDialogFooter,
	AppLabelledControl,
	AppSelect,
	AppTextInput,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	SelectItem,
} from "@vointika/ui";
import { useState } from "react";
import {
	METAOBJECT_FIELD_TYPE_CODES,
	type MetafieldTypeCode,
	metafieldTypeLabel,
} from "#/metafields";
import * as m from "#/paraglide/messages";
import type { MetaobjectField } from "../types";
import { deriveSlug, fieldSchema } from "../validators/metaobject";

export const AppMetaobjectFieldDialog = ({
	open,
	onOpenChange,
	field,
	pending,
	errorMessage,
	onSubmit,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	field?: MetaobjectField;
	pending: boolean;
	errorMessage: string | null;
	onSubmit: (field: MetaobjectField) => void;
}) => {
	const isRename = !!field;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{isRename ? m.metaobject_rename_field() : m.metaobject_add_field()}
					</DialogTitle>
					<DialogDescription>
						{isRename
							? m.metaobject_rename_field_hint()
							: m.metaobject_add_field_hint()}
					</DialogDescription>
				</DialogHeader>
				{errorMessage && (
					<AppAlert title={m.error()} description={errorMessage} />
				)}
				<FieldDraft field={field} pending={pending} onSubmit={onSubmit} />
			</DialogContent>
		</Dialog>
	);
};

// Mounted with DialogContent, so the draft starts from the field on every open
// and never outlives a close; the parent flipping `open` fires no onOpenChange.
const FieldDraft = ({
	field,
	pending,
	onSubmit,
}: {
	field?: MetaobjectField;
	pending: boolean;
	onSubmit: (field: MetaobjectField) => void;
}) => {
	const [name, setName] = useState(field?.name ?? "");
	const [key, setKey] = useState(field?.key ?? "");
	const [type, setType] = useState<MetafieldTypeCode>(
		field?.type ?? "single_line_text",
	);
	const isRename = !!field;

	const draft: MetaobjectField = isRename
		? { key: field.key, type: field.type, name }
		: { key, type, name };
	const valid = fieldSchema.safeParse(draft).success;

	return (
		<>
			<div className="flex flex-col gap-4">
				<AppLabelledControl label={m.name()} htmlFor="metaobject-field-name">
					<AppTextInput
						id="metaobject-field-name"
						autoFocus
						value={name}
						onValueChange={setName}
						onBlur={() => {
							if (!isRename && !key) setKey(deriveSlug(name));
						}}
					/>
				</AppLabelledControl>
				{isRename ? (
					<p className="text-sm text-muted-foreground">
						<span className="font-mono">{field.key}</span> ·{" "}
						{metafieldTypeLabel(field.type)}
					</p>
				) : (
					<>
						<AppLabelledControl
							label={m.metafield_key()}
							htmlFor="metaobject-field-key"
						>
							<AppTextInput
								id="metaobject-field-key"
								className="font-mono"
								value={key}
								onValueChange={setKey}
							/>
						</AppLabelledControl>
						<AppLabelledControl
							label={m.metafield_type()}
							htmlFor="metaobject-field-type"
						>
							<AppSelect
								id="metaobject-field-type"
								value={type}
								onValueChange={(v) => setType(v as MetafieldTypeCode)}
							>
								{METAOBJECT_FIELD_TYPE_CODES.map((code) => (
									<SelectItem key={code} value={code}>
										{metafieldTypeLabel(code)}
									</SelectItem>
								))}
							</AppSelect>
						</AppLabelledControl>
					</>
				)}
			</div>
			<AppDialogFooter
				onConfirm={() => onSubmit(draft)}
				disabled={!valid}
				pending={pending}
				confirmLabel={isRename ? m.save_changes() : m.metaobject_add_field()}
			/>
		</>
	);
};
