import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { MetafieldOwnerTypeCode } from "../types";
import { ownerMetafieldsEndpoint } from "./use-owner-metafields";

/** One edited field: empty `value` clears (DELETE), anything else sets (PUT). */
interface MetafieldValueChange {
	namespace: string;
	key: string;
	/** Prefixes a per-field 422 message. */
	name: string;
	value: string;
}

// Sequential, and stops at the first rejection — whatever landed before it
// stays saved, which is why the caches refresh either way.
export const useMetafieldValueSave = (
	tourOperatorId: string,
	ownerType: MetafieldOwnerTypeCode,
	ownerId: string,
) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const base = ownerMetafieldsEndpoint(tourOperatorId, ownerType, ownerId);

	return useMutation<void, Error, MetafieldValueChange[]>({
		mutationFn: async (changes) => {
			for (const change of changes) {
				try {
					if (change.value === "") {
						await authApi.delete(`${base}/${change.namespace}/${change.key}`);
					} else {
						await authApi.put(`${base}/${change.namespace}/${change.key}`, {
							value: change.value,
						});
					}
				} catch (error) {
					throw new Error(
						`${change.name}: ${apiErrorMessage(error as AxiosError)}`,
					);
				}
			}
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
				// Each write appended an audit entry.
				queryClient.invalidateQueries({
					queryKey: queryKeys.activity(tourOperatorId),
				}),
			]),
		onSuccess: () => toast.success(m.metafields_saved()),
		onError: (error) => toast.error(error.message),
	});
};
