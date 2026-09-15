import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

export const usePickupLocationActions = (
	tourOperatorId: string,
	pickupLocationId: string,
) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	const remove = useMutation<unknown, AxiosError>({
		mutationFn: () =>
			authApi.delete(
				`/tour-operators/${tourOperatorId}/pickup-locations/${pickupLocationId}`,
			),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.pickupLocations(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
		onError: () => toast.error(m.error()),
	});

	return { remove };
};
