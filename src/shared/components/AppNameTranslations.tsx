import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AppField,
	AppFormActions,
	AppFormCard,
	AppLoadingBlock,
	AppLocaleTabs,
	AppTranslationNotice,
	AppTranslationSummary,
	Button,
	Spinner,
} from "@vointika/ui";
import type { AxiosError } from "axios";
import { useState } from "react";
import { z } from "zod";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys, withLocale } from "#/lib/query-keys";
import type { QueryState } from "#/lib/query-state";
import * as m from "#/paraglide/messages";
import { AppNoTranslatableLocales } from "./AppNoTranslatableLocales";
import { AppQueryState } from "./AppQueryState";

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
						{active &&
							(canWrite ? (
								<LocaleNameForm
									key={active}
									locale={active}
									tourOperatorId={tourOperatorId}
									endpointBase={endpointBase}
									queryKeyBase={queryKeyBase}
									canonicalName={canonicalName}
									maxLength={maxLength}
								/>
							) : (
								<AppTranslationSummary
									fields={[
										[
											m.name(),
											listQuery.data?.find((t) => t.locale === active)?.name ??
												null,
										],
									]}
								/>
							))}
					</div>
				)
			}
		</AppQueryState>
	);
};

function LocaleNameForm({
	locale,
	tourOperatorId,
	endpointBase,
	queryKeyBase,
	canonicalName,
	maxLength,
}: {
	locale: string;
	tourOperatorId: string;
	endpointBase: string;
	queryKeyBase: readonly unknown[];
	canonicalName: string;
	maxLength: number;
}) {
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const overlayQuery = useQuery({
		queryKey: withLocale(queryKeyBase, locale),
		queryFn: async () =>
			(await authApi.get<NameTranslation>(`${endpointBase}/${locale}`)).data,
	});

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
		<AppQueryState query={overlayQuery} loading={<AppLoadingBlock />}>
			{(overlay) => (
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
			)}
		</AppQueryState>
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
							<Button
								type="button"
								variant="outline"
								disabled={isSaving || isClearing}
								onClick={onClear}
							>
								{isClearing && <Spinner className="size-4" />}
								{m.clear_translation()}
							</Button>
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
