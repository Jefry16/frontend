import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { AppField } from "./AppField";
import { AppFormActions } from "./AppFormActions";
import { AppLoadingBlock } from "./AppLoadingBlock";
import { AppLocaleTabs } from "./AppLocaleTabs";
import { AppNoTranslatableLocales } from "./AppNoTranslatableLocales";
import { AppTranslationNotice } from "./AppTranslationNotice";
import { AppTranslationSummary } from "./AppTranslationSummary";

interface NameTranslation {
	locale: string;
	name: string | null;
}

interface Props {
	tourOperatorId: string;
	/** e.g. `/tour-operators/{op}/audiences/{id}/translations` */
	endpointBase: string;
	/** Query-key base for the translations of THIS resource. */
	queryKeyBase: readonly unknown[];
	/** Shown as the placeholder — what an empty translation falls back to. */
	canonicalName: string;
	maxLength: number;
	/** Supported locales minus the primary. */
	translatable: string[];
	localesPending: boolean;
	/** Code → display label (the wrapper passes its localeLabel). */
	localeLabel: (code: string) => string;
	/**
	 * A prop because shared/ may not read usePermissions. False still shows the
	 * stored translation — reads are member-level; only the form goes away.
	 */
	canWrite: boolean;
}

// For resources whose only translatable field is a name. Parameterized by
// endpoint and query keys so each resource stays a thin wrapper.
export const AppNameTranslations = ({
	tourOperatorId,
	endpointBase,
	queryKeyBase,
	canonicalName,
	maxLength,
	translatable,
	localesPending,
	localeLabel,
	canWrite,
}: Props) => {
	const [picked, setPicked] = useState<string>();
	const active = picked ?? translatable[0];

	const listQuery = useQuery({
		queryKey: [...queryKeyBase],
		queryFn: async () =>
			(await authApi.get<NameTranslation[]>(endpointBase)).data,
	});
	const translated = new Set(
		(listQuery.data ?? []).filter((t) => t.name).map((t) => t.locale),
	);

	if (localesPending) {
		return <AppLoadingBlock />;
	}

	if (translatable.length === 0) {
		return <AppNoTranslatableLocales tourOperatorId={tourOperatorId} />;
	}

	return (
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
					// The list query already carries every locale's name, so the
					// read-only face needs no second fetch.
					<AppTranslationSummary
						fields={[
							[
								m.name(),
								listQuery.data?.find((t) => t.locale === active)?.name ?? null,
							],
						]}
					/>
				))}
		</div>
	);
};

// Mounts once the overlay is loaded so the input seeds from the stored value;
// the parent keys it by locale to reseed on switch.
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
		queryKey: [...queryKeyBase, locale],
		queryFn: async () =>
			(await authApi.get<NameTranslation>(`${endpointBase}/${locale}`)).data,
	});

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: [...queryKeyBase] });
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
	};

	const save = useMutation<void, AxiosError, string | null>({
		mutationFn: async (name) => {
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

	if (!overlayQuery.data) {
		return <AppLoadingBlock />;
	}

	return (
		<NameFormBody
			initialName={overlayQuery.data.name ?? ""}
			hasTranslation={Boolean(overlayQuery.data.name)}
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

// A factory, not a module-level schema: the max length differs per resource.
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
		// Blank → untranslated, so the storefront falls back to the canonical name.
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
