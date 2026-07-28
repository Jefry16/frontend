import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Field, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Spinner } from "#/components/ui/spinner";
import {
	METAFIELD_TYPE_CODES,
	type MetafieldTypeCode,
	metafieldTypeLabel,
} from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import type { MetaobjectField } from "../types";
import { deriveSlug, fieldSchema } from "../validators/metaobject";

// Add a field to a live definition, or rename an existing one — a dialog
// because it's a small structural edit on the detail page, not a page of its
// own. In rename mode key/type are shown frozen (immutable server-side).
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
	/** Present → rename mode; absent → add mode. */
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
								<Select
									value={type}
									onValueChange={(v) => setType(v as MetafieldTypeCode)}
								>
									<SelectTrigger id="metaobject-field-type" className="w-full">
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
							</Field>
						</>
					)}
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						{m.cancel()}
					</Button>
					<Button
						type="button"
						disabled={pending || !valid}
						onClick={() => onSubmit(draft)}
					>
						{pending && <Spinner className="size-4" />}
						{isRename ? m.metaobject_rename_field() : m.metaobject_add_field()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
