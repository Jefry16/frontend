import { type ReactNode, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Skeleton } from "#/components/ui/skeleton";
import { Spinner } from "#/components/ui/spinner";
import { mergeQueryState } from "#/lib/query-state";
import * as m from "#/paraglide/messages";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppQueryState } from "#/shared/components/AppQueryState";
import { useMetafieldTranslationSave } from "../hooks/use-metafield-translation-save";
import { useMetafieldTranslation } from "../hooks/use-metafield-translations";
import { useOwnerMetafields } from "../hooks/use-owner-metafields";
import type { MetafieldOwnerTypeCode, MetafieldTypeCode } from "../types";
import { AppTypedValueInput } from "./AppTypedValueInput";

const TRANSLATABLE: readonly MetafieldTypeCode[] = [
	"single_line_text",
	"multi_line_text",
];

export const AppMetafieldTranslationsCard = ({
	tourOperatorId,
	ownerType,
	ownerId,
	locale,
	canWrite,
}: {
	tourOperatorId: string;
	ownerType: MetafieldOwnerTypeCode;
	ownerId: string;
	locale: string;
	canWrite: boolean;
}) => {
	const owner = useOwnerMetafields(tourOperatorId, ownerType, ownerId);
	const overlay = useMetafieldTranslation(
		tourOperatorId,
		ownerType,
		ownerId,
		locale,
	);
	const { save, clear } = useMetafieldTranslationSave(
		tourOperatorId,
		ownerType,
		ownerId,
		locale,
	);
	const [drafts, setDrafts] = useState<Record<string, string>>({});

	const query = mergeQueryState(owner, overlay, (fields, translated) => ({
		definitions: fields.definitions.filter((d) =>
			TRANSLATABLE.includes(d.type),
		),
		values: fields.values,
		translated,
	}));

	const chrome = (body: ReactNode) => (
		<Card>
			<CardHeader>
				<CardTitle>{m.metafield_translations()}</CardTitle>
				<CardDescription>{m.metafield_translations_hint()}</CardDescription>
			</CardHeader>
			<CardContent>{body}</CardContent>
		</Card>
	);

	return (
		<AppQueryState
			query={query}
			chrome={chrome}
			loading={
				<div className="flex flex-col gap-4">
					{["a", "b"].map((k) => (
						<Skeleton key={k} className="h-12 w-full" />
					))}
				</div>
			}
		>
			{({ definitions, values, translated }) => {
				if (definitions.length === 0) return null;

				const canonical = new Map(
					values.map((v) => [`${v.namespace}.${v.key}`, v.value]),
				);
				const current = (id: string) => drafts[id] ?? translated[id] ?? "";

				const effective = (raw: string) => (raw.trim() === "" ? "" : raw);
				const changes = Object.fromEntries(
					definitions
						.map((d) => `${d.namespace}.${d.key}`)
						.filter(
							(id) =>
								drafts[id] !== undefined &&
								effective(drafts[id]) !== (translated[id] ?? ""),
						)
						.map((id) => [id, effective(drafts[id])]),
				);

				if (!canWrite) {
					return (
						<dl className="flex flex-col gap-6">
							{definitions.map((d) => {
								const id = `${d.namespace}.${d.key}`;
								return (
									<AppDetailField key={d.id} label={d.name}>
										{translated[id] ?? (
											<span className="text-muted-foreground">
												{m.not_translated()}
											</span>
										)}
									</AppDetailField>
								);
							})}
						</dl>
					);
				}

				return (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							save.mutate(changes, {
								onSettled: (_data, error) => {
									if (!error) setDrafts({});
								},
							});
						}}
						className="space-y-4"
					>
						<FieldGroup>
							{definitions.map((definition) => {
								const id = `${definition.namespace}.${definition.key}`;
								const inputId = `metafield-translation-${locale}-${definition.namespace}-${definition.key}`;
								return (
									<Field key={definition.id}>
										<FieldLabel htmlFor={inputId}>
											{definition.name}
											<span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
												{id}
											</span>
										</FieldLabel>
										<AppTypedValueInput
											inputId={inputId}
											type={definition.type}
											value={current(id)}
											onValueChange={(value) =>
												setDrafts((prev) => ({ ...prev, [id]: value }))
											}
										/>
										<p className="text-sm text-muted-foreground">
											{m.translation_canonical({
												value: canonical.get(id) ?? m.not_set(),
											})}
										</p>
									</Field>
								);
							})}
						</FieldGroup>
						{(Object.keys(changes).length > 0 ||
							Object.keys(translated).length > 0) && (
							<AppFormActions
								isPending={save.isPending}
								disabled={clear.isPending || Object.keys(changes).length === 0}
								submitLabel={m.save_translation()}
								secondary={
									Object.keys(translated).length > 0 && (
										<Button
											type="button"
											variant="outline"
											disabled={save.isPending || clear.isPending}
											onClick={() =>
												clear.mutate(undefined, {
													onSettled: (_data, error) => {
														if (!error) setDrafts({});
													},
												})
											}
										>
											{clear.isPending && <Spinner className="size-4" />}
											{m.clear_translation()}
										</Button>
									)
								}
							/>
						)}
					</form>
				);
			}}
		</AppQueryState>
	);
};
