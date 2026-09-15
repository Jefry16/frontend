import {
	AppDetailField,
	AppForm,
	AppFormActions,
	AppQueryState,
	AppSettingsCard,
	EmptyValue,
	Field,
	FieldGroup,
	FieldLabel,
} from "@vointika/ui";
import { type ReactNode, useState } from "react";
import * as m from "#/paraglide/messages";
import { usePermissions } from "#/session";
import { useMetafieldValueSave } from "../hooks/use-metafield-value-save";
import { useOwnerMetafields } from "../hooks/use-owner-metafields";
import type {
	MetafieldDefinitionListItem,
	MetafieldOwnerTypeCode,
} from "../types";
import { AppMetaobjectEntrySelect } from "./AppMetaobjectEntrySelect";
import { AppTypedValueInput } from "./AppTypedValueInput";

export const AppMetafieldsCard = ({
	tourOperatorId,
	ownerType,
	ownerId,
}: {
	tourOperatorId: string;
	ownerType: MetafieldOwnerTypeCode;
	ownerId: string;
}) => {
	const { canWrite } = usePermissions();
	const query = useOwnerMetafields(tourOperatorId, ownerType, ownerId);
	const { save, errorMessage } = useMetafieldValueSave(
		tourOperatorId,
		ownerType,
		ownerId,
	);
	const [drafts, setDrafts] = useState<Record<string, string>>({});

	const untilKnown = (
		body: ReactNode,
		phase: "pending" | "error" | "loaded",
	) =>
		phase === "pending" ? null : (
			<AppSettingsCard title={m.metafields()} description={m.metafields_hint()}>
				{body}
			</AppSettingsCard>
		);

	return (
		<AppQueryState query={query} chrome={untilKnown} loading={null}>
			{({ definitions, values }) => {
				if (definitions.length === 0) return null;
				const stored = new Map(
					values.map((v) => [`${v.namespace}.${v.key}`, v.value]),
				);

				if (!canWrite) {
					return (
						<dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							{definitions.map((definition) => (
								<AppDetailField key={definition.id} label={definition.name}>
									{stored.get(`${definition.namespace}.${definition.key}`) || (
										<EmptyValue />
									)}
								</AppDetailField>
							))}
						</dl>
					);
				}

				const current = (id: string) => drafts[id] ?? stored.get(id) ?? "";
				const setDraft = (id: string, value: string) =>
					setDrafts((prev) => ({ ...prev, [id]: value }));

				const effective = (raw: string) => (raw.trim() === "" ? "" : raw);
				const changes = definitions
					.filter((d) => {
						const id = `${d.namespace}.${d.key}`;
						const draft = drafts[id];
						return (
							draft !== undefined && effective(draft) !== (stored.get(id) ?? "")
						);
					})
					.map((d) => ({
						namespace: d.namespace,
						key: d.key,
						value: effective(drafts[`${d.namespace}.${d.key}`] ?? ""),
					}));

				return (
					<AppForm
						onSubmit={() =>
							save.mutate(changes, {
								onSettled: (_data, error) => {
									if (!error) setDrafts({});
								},
							})
						}
						errorMessage={errorMessage}
						actions={
							changes.length > 0 && (
								<AppFormActions
									isPending={save.isPending}
									submitLabel={m.save_changes()}
								/>
							)
						}
					>
						<FieldGroup>
							{definitions.map((definition) => (
								<MetafieldInput
									key={definition.id}
									tourOperatorId={tourOperatorId}
									definition={definition}
									value={current(`${definition.namespace}.${definition.key}`)}
									onChange={(value) =>
										setDraft(`${definition.namespace}.${definition.key}`, value)
									}
								/>
							))}
						</FieldGroup>
					</AppForm>
				);
			}}
		</AppQueryState>
	);
};

const MetafieldInput = ({
	tourOperatorId,
	definition,
	value,
	onChange,
}: {
	tourOperatorId: string;
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
			{definition.type === "metaobject_reference" &&
			definition.metaobjectDefinitionId ? (
				<AppMetaobjectEntrySelect
					inputId={inputId}
					tourOperatorId={tourOperatorId}
					metaobjectDefinitionId={definition.metaobjectDefinitionId}
					value={value}
					onValueChange={onChange}
				/>
			) : (
				<AppTypedValueInput
					inputId={inputId}
					type={definition.type}
					value={value}
					onValueChange={onChange}
				/>
			)}
		</Field>
	);
};
