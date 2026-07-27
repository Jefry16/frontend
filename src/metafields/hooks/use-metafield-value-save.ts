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
	/** The definition's display name — prefixes a per-field 422 message. */
	name: string;
	value: string;
}

// Applies the editor's dirty fields sequentially (each write audits on the
// owner's timeline). Stops at the first rejection and surfaces it as
// "<field name>: <backend message>"; whatever landed before it stays saved,
// so the caches refresh either way.
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
		// Returned so the mutation stays pending until the values refetch lands —
		// the editor clears its drafts in ITS onSettled (which runs after this
		// resolves) against the fresh cache, never flashing pre-save values.
		onSettled: () =>
			Promise.all([
				queryClient.invalidateQueries({
					queryKey: queryKeys.metafieldValues(
						tourOperatorId,
						ownerType,
						ownerId,
					),
				}),
				// Each write appended an audit entry on the owner's timeline.
				queryClient.invalidateQueries({
					queryKey: queryKeys.activity(tourOperatorId),
				}),
			]),
		onSuccess: () => toast.success(m.metafields_saved()),
		onError: (error) => toast.error(error.message),
	});
};
