import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { OperatorTranslation } from "../types";
import {
	type OperatorTranslationFormData,
	type OperatorTranslationPayload,
	operatorTranslationSchema,
} from "../validators/operator-translation";

// One locale's shop-text editor: PUT upserts the overlay, DELETE clears it
// (every field falls back to canonical). Both refresh the switcher dots, this
// locale's row, and the audit trail.
//
// The PUT is a full replace, not a patch — the backend rebuilds the row from
// the body, so an omitted field is a cleared field. That is why the form always
// posts all five: seeding `defaultValues` from the fetched overlay and
// submitting the whole schema is what keeps an untouched field intact.
export const useOperatorTranslationForm = ({
	tourOperatorId,
	locale,
	translation,
}: {
	tourOperatorId: string;
	locale: string;
	translation: OperatorTranslation;
}) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const endpoint = `/tour-operators/${tourOperatorId}/translations/${locale}`;

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.operatorTranslations(tourOperatorId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.operatorTranslation(tourOperatorId, locale),
		});
	};

	const save = useMutation<void, AxiosError, OperatorTranslationPayload>({
		mutationFn: async (data) => {
			await authApi.put(endpoint, data);
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
		// null (untranslated) → empty inputs; the schema collapses empties back
		// to null on submit so they fall back to the canonical shop text.
		defaultValues: {
			slogan: translation.slogan ?? "",
			shortDescription: translation.shortDescription ?? "",
			seoTitle: translation.seoTitle ?? "",
			seoDescription: translation.seoDescription ?? "",
			passwordMessage: translation.passwordMessage ?? "",
		} as OperatorTranslationFormData,
		validators: { onSubmit: operatorTranslationSchema },
		onSubmit: ({ value }) =>
			save.mutate(operatorTranslationSchema.parse(value)),
	});

	return {
		form,
		errorMessage,
		isPending: save.isPending,
		clear: clear.mutate,
		isClearing: clear.isPending,
	};
};
