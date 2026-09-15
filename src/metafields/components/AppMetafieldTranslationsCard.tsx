import {
	AppDetailField,
	AppForm,
	AppFormActions,
	AppFormSkeleton,
	AppQueryState,
	AppSettingsCard,
	Field,
	FieldGroup,
	FieldLabel,
} from "@vointika/ui";
import { type ReactNode, useState } from "react";
import * as m from "#/paraglide/messages";
import { usePermissions } from "#/session";
import { AppClearTranslationButton } from "#/shared/components/AppClearTranslationButton";
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
}: {
	tourOperatorId: string;
	ownerType: MetafieldOwnerTypeCode;
	ownerId: string;
	locale: string;
}) => {
	const { canWrite } = usePermissions();
	const owner = useOwnerMetafields(tourOperatorId, ownerType, ownerId);
	const overlay = useMetafieldTranslation(
		tourOperatorId,
		ownerType,
		ownerId,
		locale,
	);
	const { save, clear, errorMessage } = useMetafieldTranslationSave(
		tourOperatorId,
		ownerType,
		ownerId,
		locale,
	);
	const [drafts, setDrafts] = useState<Record<string, string>>({});

	const titled = (body: ReactNode) => (
		<AppSettingsCard
			title={m.metafield_translations()}
			description={m.metafield_translations_hint()}
		>
			{body}
		</AppSettingsCard>
	);
	const untilKnown = (
		body: ReactNode,
		phase: "pending" | "error" | "loaded",
	) => (phase === "error" ? titled(body) : body);

	return (
		<AppQueryState query={owner} chrome={untilKnown} loading={null}>
			{(fields) => {
				const definitions = fields.definitions.filter((d) =>
					TRANSLATABLE.includes(d.type),
				);
				if (definitions.length === 0) return null;
				const values = fields.values;

				return (
					<AppQueryState
						query={overlay}
						chrome={titled}
						loading={<AppFormSkeleton rows={2} card={false} />}
					>
						{(translated) => {
							const canonical = new Map(
								values.map((v) => [`${v.namespace}.${v.key}`, v.value]),
							);
							const current = (id: string) =>
								drafts[id] ?? translated[id] ?? "";

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
										(Object.keys(changes).length > 0 ||
											Object.keys(translated).length > 0) && (
											<AppFormActions
												isPending={save.isPending}
												disabled={
													clear.isPending || Object.keys(changes).length === 0
												}
												submitLabel={m.save_translation()}
												secondary={
													Object.keys(translated).length > 0 && (
														<AppClearTranslationButton
															isClearing={clear.isPending}
															disabled={save.isPending}
															onClick={() =>
																clear.mutate(undefined, {
																	onSettled: (_data, error) => {
																		if (!error) setDrafts({});
																	},
																})
															}
														/>
													)
												}
											/>
										)
									}
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
								</AppForm>
							);
						}}
					</AppQueryState>
				);
			}}
		</AppQueryState>
	);
};
