import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { Slot } from "../types";

export const useSlotActions = (tourOperatorId: string, slotId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const base = `/tour-operators/${tourOperatorId}/slots/${slotId}`;

	const applyRefreshed = (slot: Slot) => {
		queryClient.setQueryData(queryKeys.slot(tourOperatorId, slotId), slot);
		queryClient.invalidateQueries({
			queryKey: queryKeys.slots(tourOperatorId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
	};

	const cancel = useMutation<Slot, AxiosError>({
		mutationFn: async () => (await authApi.post<Slot>(`${base}/cancel`)).data,
		onSuccess: (slot) => {
			applyRefreshed(slot);
			toast.success(m.slot_cancelled());
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	const setCapacities = useMutation<
		Slot,
		AxiosError,
		{ audienceId: string; capacity: number }[]
	>({
		mutationFn: async (capacities) =>
			(await authApi.patch<Slot>(base, { capacities })).data,
		onSuccess: (slot) => {
			applyRefreshed(slot);
			toast.updated(m.availability());
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	return { cancel, setCapacities };
};
