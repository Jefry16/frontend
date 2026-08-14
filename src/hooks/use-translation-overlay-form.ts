import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import type { z } from "zod";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";

/**
 * One locale's overlay on a canonical record: PUT upserts it, DELETE clears it
 * and the locale falls back to canonical.
 *
 * **The PUT is a full replace**, so the form seeds from the fetched overlay and
 * always submits every field — an omitted field is a *cleared* field. (The
 * metafield overlay that renders under three of these editors is the exception
 * and does NOT use this hook; see `use-metafield-translation-save.ts`.)
 *
 * Errors go to an inline `errorMessage` rather than a toast, because the reason
 * belongs beside the field that caused it — `conflictMessage` is for resources
 * whose 409 means one specific thing (a localized slug already taken).
 */
export const useTranslationOverlayForm = <TValues, TPayload>({
	endpoint,
	schema,
	defaultValues,
	invalidateKeys,
	conflictMessage,
}: {
	endpoint: string;
	schema: z.ZodType<TPayload, TValues>;
	defaultValues: TValues;
	/** Every key the save touches. Translation writes append audit entries, so
	 * the activity trail is one of them at every call site. */
	invalidateKeys: readonly (readonly unknown[])[];
	/** Mapped from a 409 where the backend has exactly one reason to send one. */
	conflictMessage?: string;
}) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const invalidate = () => {
		for (const queryKey of invalidateKeys) {
			queryClient.invalidateQueries({ queryKey });
		}
	};

	const save = useMutation<void, AxiosError, TPayload>({
		mutationFn: async (data) => {
			await authApi.put(endpoint, data);
		},
		onSuccess: () => {
			setErrorMessage(null);
			toast.success(m.translation_saved());
			invalidate();
		},
		onError: (error) =>
			setErrorMessage(
				conflictMessage && error.response?.status === 409
					? conflictMessage
					: apiErrorMessage(error),
			),
	});

	const clear = useMutation<void, AxiosError, void>({
		mutationFn: async () => {
			await authApi.delete(endpoint);
		},
		onSuccess: () => {
			setErrorMessage(null);
			toast.deleted(m.translation());
			invalidate();
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const form = useForm({
		defaultValues,
		validators: { onSubmit: schema },
		onSubmit: ({ value }) => save.mutate(schema.parse(value)),
	});

	return {
		form,
		errorMessage,
		isPending: save.isPending,
		clear: clear.mutate,
		isClearing: clear.isPending,
	};
};
