import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AppField,
	AppFormActions,
	AppFormCard,
	AppLoadingBlock,
	AppLocaleTabs,
	AppQueryState,
	AppTranslationNotice,
	AppTranslationSummary,
	type QueryState,
	useAppToast,
} from "@vointika/ui";
import type { AxiosError } from "axios";
import { useState } from "react";
import { z } from "zod";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys, withLocale } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppClearTranslationButton } from "./AppClearTranslationButton";
import { AppNoTranslatableLocales } from "./AppNoTranslatableLocales";

interface NameTranslation {
	locale: string;
	name: string | null;
}

interface Props {
	tourOperatorId: string;
	endpointBase: string;
	queryKeyBase: readonly unknown[];
	canonicalName: string;
	maxLength: number;
	translatable: string[];
	localesQuery: QueryState<unknown>;
	localeLabel: (code: string) => string;
	canWrite: boolean;
}

export const AppNameTranslations = ({
	tourOperatorId,
	endpointBase,
	queryKeyBase,
	canonicalName,
	maxLength,
	translatable,
	localesQuery,
	localeLabel,
	canWrite,
}: Props) => {
	const [picked, setPicked] = useState<string>();
	const active = picked ?? translatable[0];

	const listQuery = useQuery({
		queryKey: queryKeyBase,
		queryFn: async () =>
			(await authApi.get<NameTranslation[]>(endpointBase)).data,
	});
	const translated = new Set(
		(listQuery.data ?? []).filter((t) => t.name).map((t) => t.locale),
	);

	const overlayQuery = useQuery({
		queryKey: withLocale(queryKeyBase, active ?? ""),
		enabled: Boolean(active),
		queryFn: async () =>
			(await authApi.get<NameTranslation>(`${endpointBase}/${active}`)).data,
	});

	return (
		<AppQueryState query={localesQuery} loading={<AppLoadingBlock />}>
			{() =>
				translatable.length === 0 ? (
					<AppNoTranslatableLocales tourOperatorId={tourOperatorId} />
				) : (
					<div className="flex flex-col gap-4">
						<AppLocaleTabs
							locales={translatable}
							active={active}
							onSelect={setPicked}
							translated={translated}
							label={localeLabel}
						/>
						{active && (
							<AppQueryState query={overlayQuery} loading={<AppLoadingBlock />}>
								{(overlay) =>
									canWrite ? (
										<LocaleNameForm
											key={active}
											locale={active}
											overlay={overlay}
											tourOperatorId={tourOperatorId}
											endpointBase={endpointBase}
											queryKeyBase={queryKeyBase}
											canonicalName={canonicalName}
											maxLength={maxLength}
										/>
									) : (
										<AppTranslationSummary
											fields={[[m.name(), overlay.name]]}
										/>
									)
								}
							</AppQueryState>
						)}
					</div>
				)
			}
		</AppQueryState>
	);
};

function LocaleNameForm({
	locale,
	overlay,
	tourOperatorId,
	endpointBase,
	queryKeyBase,
	canonicalName,
	maxLength,
}: {
	locale: string;
	overlay: NameTranslation;
	tourOperatorId: string;
	endpointBase: string;
	queryKeyBase: readonly unknown[];
	canonicalName: string;
	maxLength: number;
}) {
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: queryKeyBase });
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
	};

	const save = useMutation<void, AxiosError, string | null>({
		mutationFn: async (name) => {
			// A full replace: an omitted field is a cleared field.
			await authApi.put(`${endpointBase}/${locale}`, { name });
		},
		onSuccess: () => {
			setErrorMessage(null);
			toast.success(m.translation_saved());
			invalidate();
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const clear = useMutation<void, AxiosError, void>({
		mutationFn: async () => {
			await authApi.delete(`${endpointBase}/${locale}`);
		},
		onSuccess: () => {
			setErrorMessage(null);
			toast.deleted(m.translation());
			invalidate();
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	return (
		<NameFormBody
			initialName={overlay.name ?? ""}
			hasTranslation={Boolean(overlay.name)}
			canonicalName={canonicalName}
			maxLength={maxLength}
			errorMessage={errorMessage}
			isSaving={save.isPending}
			isClearing={clear.isPending}
			onSave={(name) => save.mutate(name)}
			onClear={() => clear.mutate()}
		/>
	);
}

const nameSchema = (maxLength: number) =>
	z.object({
		name: z
			.string()
			.trim()
			.max(maxLength, m.validation_max_length({ count: maxLength })),
	});

function NameFormBody({
	initialName,
	hasTranslation,
	canonicalName,
	maxLength,
	errorMessage,
	isSaving,
	isClearing,
	onSave,
	onClear,
}: {
	initialName: string;
	hasTranslation: boolean;
	canonicalName: string;
	maxLength: number;
	errorMessage: string | null;
	isSaving: boolean;
	isClearing: boolean;
	onSave: (name: string | null) => void;
	onClear: () => void;
}) {
	const form = useForm({
		defaultValues: { name: initialName },
		validators: { onSubmit: nameSchema(maxLength) },
		onSubmit: ({ value }) => onSave(value.name.trim() || null),
	});

	return (
		<AppFormCard
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			notice={<AppTranslationNotice />}
			actions={
				<AppFormActions
					isPending={isSaving}
					disabled={isClearing}
					submitLabel={m.save_translation()}
					secondary={
						hasTranslation && (
							<AppClearTranslationButton
								isClearing={isClearing}
								disabled={isSaving}
								onClick={onClear}
							/>
						)
					}
				/>
			}
		>
			<form.Field name="name">
				{(field) => (
					<AppField
						field={field}
						label={m.name()}
						placeholder={canonicalName}
						description={m.translation_canonical({ value: canonicalName })}
					/>
				)}
			</form.Field>
		</AppFormCard>
	);
}
