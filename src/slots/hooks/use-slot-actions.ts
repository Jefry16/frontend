import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { Slot, SlotStatus } from "../types";

// The mutating actions on a single slot (all ADMIN+): cancel (terminal, 409 if
// already), set status (AVAILABLE ⇄ SOLD_OUT), edit per-tier capacity (below
// booked → 422). Each returns the refreshed slot — written straight into the
// detail cache — and invalidates the list.
export const useSlotActions = (tourOperatorId: string, slotId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const base = `/tour-operators/${tourOperatorId}/slots/${slotId}`;

	const applyRefreshed = (slot: Slot) => {
		queryClient.setQueryData(queryKeys.slot(tourOperatorId, slotId), slot);
		queryClient.invalidateQueries({
			queryKey: queryKeys.slots(tourOperatorId),
		});
		// Cancel / status / capacity all append audit entries — refresh the
		// trail (this page's own Activity timeline included).
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

	const setStatus = useMutation<Slot, AxiosError, SlotStatus>({
		mutationFn: async (status) =>
			(await authApi.patch<Slot>(base, { status })).data,
		onSuccess: (slot) => {
			applyRefreshed(slot);
			toast.updated(m.availability());
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

	return { cancel, setStatus, setCapacities };
};
