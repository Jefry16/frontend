import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Languages } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Spinner } from "#/components/ui/spinner";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";
import { AppAlert } from "./AppAlert";
import { AppLink } from "./AppLink";
import { AppLocaleTabs } from "./AppLocaleTabs";

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
	/** Supported locales minus the primary (the wrapper owns the operator-locales fetch). */
	translatable: string[];
	localesPending: boolean;
	/** Code → display label (the wrapper passes its localeLabel). */
	localeLabel: (code: string) => string;
}

// The shared single-name translation editor (resources whose only translatable
// field is a name: audiences, pickup locations): a locale switcher (supported
// minus primary) over a one-field per-locale form. Save PUTs the trimmed name;
// blank saves as untranslated; Clear DELETEs the overlay. The canonical name
// shows as the placeholder so the fallback is visible. Parameterized by
// endpoint + query keys so each resource stays a thin wrapper.
export const AppNameTranslations = ({
	tourOperatorId,
	endpointBase,
	queryKeyBase,
	canonicalName,
	maxLength,
	translatable,
	localesPending,
	localeLabel,
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
		return (
			<div className="flex justify-center py-10">
				<Spinner />
			</div>
		);
	}

	if (translatable.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center gap-2 py-10 text-center">
					<Languages className="size-8 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">
						{m.translations_no_languages_generic()}
					</p>
					<AppLink
						to="/tour-operators/$tourOperatorId/settings/languages"
						params={{ tourOperatorId }}
						className="text-sm font-medium text-primary hover:underline"
					>
						{m.manage_languages()}
					</AppLink>
				</CardContent>
			</Card>
		);
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
			{active && (
				<LocaleNameForm
					key={active}
					locale={active}
					endpointBase={endpointBase}
					queryKeyBase={queryKeyBase}
					canonicalName={canonicalName}
					maxLength={maxLength}
				/>
			)}
		</div>
	);
};

// One locale's form. Mounts once the overlay is loaded so the input seeds from
// the stored value (keyed by locale in the parent to reseed on switch).
function LocaleNameForm({
	locale,
	endpointBase,
	queryKeyBase,
	canonicalName,
	maxLength,
}: {
	locale: string;
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
		return (
			<div className="flex justify-center py-10">
				<Spinner />
			</div>
		);
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
	const [name, setName] = useState(initialName);
	const [localError, setLocalError] = useState<string | null>(null);

	const submit = () => {
		const trimmed = name.trim();
		if (trimmed.length > maxLength) {
			setLocalError(m.validation_max_length({ count: maxLength }));
			return;
		}
		setLocalError(null);
		// Blank → untranslated (falls back to the canonical name).
		onSave(trimmed.length ? trimmed : null);
	};

	const error = localError ?? errorMessage;

	return (
		<Card>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						submit();
					}}
					className="space-y-4"
				>
					<AppAlert
						variant="info"
						title={m.translation()}
						description={m.translation_fallback_help()}
					/>
					{error && <AppAlert title={m.error()} description={error} />}
					<Field>
						<FieldLabel htmlFor="translated-name">{m.name()}</FieldLabel>
						<Input
							id="translated-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={canonicalName}
						/>
						<FieldDescription>
							{m.translation_canonical({ value: canonicalName })}
						</FieldDescription>
					</Field>
					<div className="flex justify-end gap-2">
						{hasTranslation && (
							<Button
								type="button"
								variant="outline"
								disabled={isSaving || isClearing}
								onClick={onClear}
							>
								{isClearing && <Spinner className="size-4" />}
								{m.clear_translation()}
							</Button>
						)}
						<Button type="submit" disabled={isSaving || isClearing}>
							{isSaving && <Spinner className="size-4" />}
							{m.save_translation()}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
