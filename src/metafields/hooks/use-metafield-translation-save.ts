import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
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
		onSuccess: () => toast.success(m.translation_saved()),
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	const clear = useMutation<void, AxiosError, void>({
		mutationFn: async () => {
			await authApi.delete(endpoint);
		},
		onSettled: invalidate,
		onSuccess: () => toast.deleted(m.translation()),
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	return { save, clear };
};
