import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { MetafieldOwnerTypeCode } from "../types";
import { ownerMetafieldsEndpoint } from "./use-owner-metafields";

interface MetafieldValueChange {
	namespace: string;
	key: string;
	value: string;
}

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
			// A merge, not a replace: a key not sent is left alone, and a key sent blank
			// is CLEARED. Every entry is validated before any is written.
			await authApi.put(endpoint, { values });
		},
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
		onError: (error) => toast.error(apiErrorMessage(error)),
	});
};
