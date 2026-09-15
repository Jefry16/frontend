import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { useState } from "react";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { MetafieldOwnerTypeCode } from "../types";
import { ownerMetafieldTranslationsEndpoint } from "./use-owner-metafields";

export const useMetafieldTranslationSave = (
	tourOperatorId: string,
	ownerType: MetafieldOwnerTypeCode,
	ownerId: string,
	locale: string,
) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const endpoint = `${ownerMetafieldTranslationsEndpoint(tourOperatorId, ownerType, ownerId)}/${locale}`;
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const invalidate = () =>
		Promise.all([
			queryClient.invalidateQueries({
				queryKey: queryKeys.metafieldTranslationLocales(
					tourOperatorId,
					ownerType,
					ownerId,
				),
			}),
			queryClient.invalidateQueries({
				queryKey: queryKeys.metafieldTranslation(
					tourOperatorId,
					ownerType,
					ownerId,
					locale,
				),
			}),
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			}),
		]);

	const save = useMutation<void, AxiosError, Record<string, string>>({
		mutationFn: async (values) => {
			// A patch, unlike every other translation write here, and unlike what the
			// backend's own javadoc claims. An absent key is left alone; a blank clears.
			await authApi.put(endpoint, { values });
		},
		onSettled: invalidate,
		onSuccess: () => {
			setErrorMessage(null);
			toast.success(m.translation_saved());
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const clear = useMutation<void, AxiosError, void>({
		mutationFn: async () => {
			await authApi.delete(endpoint);
		},
		onSettled: invalidate,
		onSuccess: () => {
			setErrorMessage(null);
			toast.deleted(m.translation());
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	return { save, clear, errorMessage };
};
