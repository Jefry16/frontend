import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

// The mutating actions on a single pickup location: delete (ADMIN+). Success
// copy + navigation are left to the caller's per-call onSuccess (it navigates
// back to the list); this invalidates the list and error-toasts.
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
			// The delete appended an audit entry — refresh the trail.
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
		onError: () => toast.error(m.error()),
	});

	return { remove };
};
