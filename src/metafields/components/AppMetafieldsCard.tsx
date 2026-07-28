import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { AppError } from "#/shared/components/AppError";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { useMetafieldValueSave } from "../hooks/use-metafield-value-save";
import { useOwnerMetafields } from "../hooks/use-owner-metafields";
import type {
	MetafieldDefinitionListItem,
	MetafieldOwnerTypeCode,
} from "../types";
import { AppTypedValueInput } from "./AppTypedValueInput";

// The per-resource metafields editor: one input per definition for this owner
// type (unset fields render empty), dirty fields saved together — a non-empty
// value PUTs, an emptied one clears. Renders nothing while the operator has no
// definitions for the kind; the catalogue is managed in Content → Metafields.
export const AppMetafieldsCard = ({
	tourOperatorId,
	ownerType,
	ownerId,
}: {
	tourOperatorId: string;
	ownerType: MetafieldOwnerTypeCode;
	ownerId: string;
}) => {
	const { definitions, values, isPending, isError, refetch } =
		useOwnerMetafields(tourOperatorId, ownerType, ownerId);
	const save = useMetafieldValueSave(tourOperatorId, ownerType, ownerId);
	const [drafts, setDrafts] = useState<Record<string, string>>({});

	if (isError) {
		return (
			<Card>
				<CardContent>
					<AppError onRetry={refetch} />
				</CardContent>
			</Card>
		);
	}
	if (isPending) {
		return (
			<Card>
				<CardContent className="flex flex-col gap-4">
					{["a", "b"].map((k) => (
						<Skeleton key={k} className="h-12 w-full" />
					))}
				</CardContent>
			</Card>
		);
	}
	if (definitions.length === 0) return null;

	const stored = new Map(
		values.map((v) => [`${v.namespace}.${v.key}`, v.value]),
	);
	const current = (id: string) => drafts[id] ?? stored.get(id) ?? "";
	const setDraft = (id: string, value: string) =>
		setDrafts((prev) => ({ ...prev, [id]: value }));

	// A whitespace-only draft means "clear" — the backend 422s a blank PUT.
	const effective = (raw: string) => (raw.trim() === "" ? "" : raw);
	const changes = definitions
		.filter((d) => {
			const id = `${d.namespace}.${d.key}`;
			const draft = drafts[id];
			return draft !== undefined && effective(draft) !== (stored.get(id) ?? "");
		})
		.map((d) => ({
			namespace: d.namespace,
			key: d.key,
			name: d.name,
			value: effective(drafts[`${d.namespace}.${d.key}`] ?? ""),
		}));

	return (
		<Card>
			<CardHeader>
				<CardTitle>{m.metafields()}</CardTitle>
				<CardDescription>{m.metafields_hint()}</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						// Clear drafts in onSettled — it runs AFTER the hook's
						// invalidation resolves, so the inputs land on the fresh
						// cache. On error the drafts stay (the failed edit survives).
						save.mutate(changes, {
							onSettled: (_data, error) => {
								if (!error) setDrafts({});
							},
						});
					}}
					className="space-y-4"
				>
					<FieldGroup>
						{definitions.map((definition) => (
							<MetafieldInput
								key={definition.id}
								definition={definition}
								value={current(`${definition.namespace}.${definition.key}`)}
								onChange={(value) =>
									setDraft(`${definition.namespace}.${definition.key}`, value)
								}
							/>
						))}
					</FieldGroup>
					{changes.length > 0 && (
						<AppFormActions
							isPending={save.isPending}
							submitLabel={m.save_changes()}
						/>
					)}
				</form>
			</CardContent>
		</Card>
	);
};

// One definition's labelled, type-aware input. Values are strings on the wire
// for every type; the backend validates + normalizes against the definition.
const MetafieldInput = ({
	definition,
	value,
	onChange,
}: {
	definition: MetafieldDefinitionListItem;
	value: string;
	onChange: (value: string) => void;
}) => {
	const inputId = `metafield-${definition.namespace}-${definition.key}`;
	return (
		<Field>
			<FieldLabel htmlFor={inputId}>
				{definition.name}
				<span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
					{definition.namespace}.{definition.key}
				</span>
			</FieldLabel>
			<AppTypedValueInput
				inputId={inputId}
				type={definition.type}
				value={value}
				onValueChange={onChange}
			/>
		</Field>
	);
};
