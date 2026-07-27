import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { PageTranslation } from "../types";
import {
	type PageTranslationFormData,
	type PageTranslationPayload,
	pageTranslationSchema,
} from "../validators/page-translation";

// One locale's translation editor: PUT upserts the overlay, DELETE clears it
// (falls back to canonical). Both refresh the switcher dots, this locale's
// row, and the audit trail.
export const usePageTranslationForm = ({
	tourOperatorId,
	pageId,
	locale,
	translation,
}: {
	tourOperatorId: string;
	pageId: string;
	locale: string;
	translation: PageTranslation;
}) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const endpoint = `/tour-operators/${tourOperatorId}/pages/${pageId}/translations/${locale}`;

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.pageTranslations(tourOperatorId, pageId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.pageTranslation(tourOperatorId, pageId, locale),
		});
	};

	const save = useMutation<void, AxiosError, PageTranslationPayload>({
		mutationFn: async (data) => {
			await authApi.put(endpoint, data);
		},
		onSuccess: () => {
			setErrorMessage(null);
			toast.success(m.translation_saved());
			invalidate();
		},
		// 409 is specifically a localized-handle collision (per operator + locale).
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
		// null (untranslated) → empty inputs; the schema collapses empties back
		// to null on submit so they fall back to the canonical content.
		defaultValues: {
			title: translation.title ?? "",
			body: translation.body ?? "",
			seoTitle: translation.seoTitle ?? "",
			seoDescription: translation.seoDescription ?? "",
			slug: translation.slug ?? "",
		} as PageTranslationFormData,
		validators: { onSubmit: pageTranslationSchema },
		onSubmit: ({ value }) => save.mutate(pageTranslationSchema.parse(value)),
	});

	return {
		form,
		errorMessage,
		isPending: save.isPending,
		clear: clear.mutate,
		isClearing: clear.isPending,
	};
};
