import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import type { z } from "zod";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";

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
	invalidateKeys: readonly (readonly unknown[])[];
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

	const blankValues = Object.fromEntries(
		Object.keys(defaultValues as object).map((field) => [field, ""]),
	) as TValues;

	const clear = useMutation<void, AxiosError, void>({
		mutationFn: async () => {
			await authApi.delete(endpoint);
		},
		onSuccess: () => {
			setErrorMessage(null);
			form.reset(blankValues, { keepDefaultValues: true });
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
