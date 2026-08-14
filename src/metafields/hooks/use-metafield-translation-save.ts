import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { MetafieldOwnerTypeCode } from "../types";
import { ownerMetafieldTranslationsEndpoint } from "./use-owner-metafields";

/**
 * One locale's overlay: save the edited keys, or drop the locale entirely.
 *
 * **The PUT is a patch, not a replace** — verified against the use case, whose
 * own controller javadoc says otherwise. An absent key is left alone and a
 * **blank value clears** that key. So the payload carries exactly the keys the
 * operator edited, and a box they emptied must ride along as `""` rather than be
 * omitted: omitting it would leave the old translation in place, which is the
 * opposite of what emptying the box means.
 *
 * The 422 names the offending key (the backend validates every key before
 * writing any), so the toast carries the backend's message rather than a generic
 * one — there is something the operator can act on.
 */
export const useMetafieldTranslationSave = (
	tourOperatorId: string,
	ownerType: MetafieldOwnerTypeCode,
	ownerId: string,
	locale: string,
) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const endpoint = `${ownerMetafieldTranslationsEndpoint(tourOperatorId, ownerType, ownerId)}/${locale}`;

	// Returned so the mutation stays pending until the refetch lands — the card
	// clears its drafts once this resolves and would otherwise flash stale text.
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
