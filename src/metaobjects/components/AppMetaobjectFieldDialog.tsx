import {
	AppAlert,
	AppDialogFooter,
	AppSelect,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	Field,
	FieldLabel,
	Input,
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
	const [name, setName] = useState("");
	const [key, setKey] = useState("");
	const [type, setType] = useState<MetafieldTypeCode>("single_line_text");
	const isRename = !!field;

	const draft: MetaobjectField = isRename
		? { key: field.key, type: field.type, name }
		: { key, type, name };
	const valid = fieldSchema.safeParse(draft).success;

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (next) {
					setName(field?.name ?? "");
					setKey(field?.key ?? "");
					setType(field?.type ?? "single_line_text");
				}
			}}
		>
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
				<div className="flex flex-col gap-4">
					<Field>
						<FieldLabel htmlFor="metaobject-field-name">{m.name()}</FieldLabel>
						<Input
							id="metaobject-field-name"
							autoFocus
							value={name}
							onChange={(e) => setName(e.target.value)}
							onBlur={() => {
								if (!isRename && !key) setKey(deriveSlug(name));
							}}
						/>
					</Field>
					{isRename ? (
						<p className="text-sm text-muted-foreground">
							<span className="font-mono">{field.key}</span> ·{" "}
							{metafieldTypeLabel(field.type)}
						</p>
					) : (
						<>
							<Field>
								<FieldLabel htmlFor="metaobject-field-key">
									{m.metafield_key()}
								</FieldLabel>
								<Input
									id="metaobject-field-key"
									className="font-mono"
									value={key}
									onChange={(e) => setKey(e.target.value)}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="metaobject-field-type">
									{m.metafield_type()}
								</FieldLabel>
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
							</Field>
						</>
					)}
				</div>
				<AppDialogFooter
					onConfirm={() => onSubmit(draft)}
					disabled={!valid}
					pending={pending}
				/>
			</DialogContent>
		</Dialog>
	);
};
