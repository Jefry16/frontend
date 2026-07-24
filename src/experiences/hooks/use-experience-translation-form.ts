import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { ExperienceTranslation } from "../types";
import {
	type ExperienceTranslationFormData,
	type ExperienceTranslationPayload,
	experienceTranslationSchema,
} from "../validators/experience-translation";

// One locale's translation editor: PUT upserts the overlay, DELETE clears it
// (falls back to canonical). Both invalidate the translations list + this
// locale's row so the switcher dots and the form re-baseline.
export const useExperienceTranslationForm = ({
	tourOperatorId,
	experienceId,
	locale,
	translation,
}: {
	tourOperatorId: string;
	experienceId: string;
	locale: string;
	translation: ExperienceTranslation;
}) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const endpoint = `/tour-operators/${tourOperatorId}/experiences/${experienceId}/translations/${locale}`;

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.experienceTranslations(tourOperatorId, experienceId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.experienceTranslation(
				tourOperatorId,
				experienceId,
				locale,
			),
		});
	};

	const save = useMutation<void, AxiosError, ExperienceTranslationPayload>({
		mutationFn: async (data) => {
			await authApi.put(endpoint, data);
		},
		onSuccess: () => {
			setErrorMessage(null);
			toast.success(m.translation_saved());
			invalidate();
		},
		// 409 is specifically a localized-slug collision (per operator + locale).
		onError: (error) =>
			setErrorMessage(
				error.response?.status === 409
					? m.slug_taken()
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
		// null (untranslated) → empty controlled inputs; the schema collapses empty
		// values back to null on submit so they fall back to the canonical text.
		defaultValues: {
			name: translation.name ?? "",
			description: translation.description ?? "",
			longDescription: translation.longDescription ?? "",
			highlights: translation.highlights ?? [],
			included: translation.included ?? [],
			notIncluded: translation.notIncluded ?? [],
			slug: translation.slug ?? "",
		} as ExperienceTranslationFormData,
		validators: { onSubmit: experienceTranslationSchema },
		onSubmit: ({ value }) =>
			save.mutate(experienceTranslationSchema.parse(value)),
	});

	return {
		form,
		errorMessage,
		isPending: save.isPending,
		clear: clear.mutate,
		isClearing: clear.isPending,
	};
};
