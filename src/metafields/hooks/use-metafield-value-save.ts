import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { MetafieldOwnerTypeCode } from "../types";
import { ownerMetafieldsEndpoint } from "./use-owner-metafields";

/** One edited field. An empty `value` clears it; anything else sets it. */
interface MetafieldValueChange {
	namespace: string;
	key: string;
	value: string;
}

/**
 * One request for the whole edit, keyed `namespace.key`.
 *
 * **A key that is not sent is left alone** — this is a merge, not a replace — so
 * the card's job is to pass only what the operator actually changed, which is
 * what it already computes. **A key sent blank is CLEARED**, which is how an
 * emptied box gets through; omitting it would silently keep the old value, the
 * opposite of what emptying it means.
 *
 * The backend validates every entry before writing any, so the whole edit lands
 * or none of it does. That is the change worth knowing about: this used to be a
 * loop of one request per field that stopped at the first rejection and left
 * whatever preceded it saved, so a refused edit could leave the operator halfway.
 * It cannot any more.
 */
export const useMetafieldValueSave = (
	tourOperatorId: string,
	ownerType: MetafieldOwnerTypeCode,
	ownerId: string,
) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const endpoint = ownerMetafieldsEndpoint(tourOperatorId, ownerType, ownerId);

	return useMutation<void, AxiosError, MetafieldValueChange[]>({
		mutationFn: async (changes) => {
			const values = Object.fromEntries(
				changes.map((c) => [`${c.namespace}.${c.key}`, c.value]),
			);
			await authApi.put(endpoint, { values });
		},
		// Returned so the mutation stays pending until the refetch lands: the
		// editor clears its drafts after this resolves, and would otherwise flash
		// the pre-save values.
		onSettled: () =>
			Promise.all([
				queryClient.invalidateQueries({
					queryKey: queryKeys.metafieldValues(
						tourOperatorId,
						ownerType,
						ownerId,
					),
				}),
				queryClient.invalidateQueries({
					queryKey: queryKeys.activity(tourOperatorId),
				}),
			]),
		onSuccess: () => toast.success(m.metafields_saved()),
		// The 422 names the offending key, so it beats a generic failure.
		onError: (error) => toast.error(apiErrorMessage(error)),
	});
};
