import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

// The mutating actions on a single experience: publish / unpublish (both ADMIN+,
// reversible — there is no delete; an experience is retired via unpublish since
// it owns slots/bookings). Both toast + invalidate the detail and the list.
export const useExperienceActions = (
	tourOperatorId: string,
	experienceId: string,
) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const base = `/tour-operators/${tourOperatorId}/experiences/${experienceId}`;

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.experience(tourOperatorId, experienceId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.experiences(tourOperatorId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
	};

	const publish = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.post(`${base}/publish`),
		onSuccess: () => {
			toast.success(m.experience_published());
			invalidate();
		},
		onError: () => toast.error(m.error()),
	});

	const unpublish = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.post(`${base}/unpublish`),
		onSuccess: () => {
			toast.success(m.experience_unpublished());
			invalidate();
		},
		onError: () => toast.error(m.error()),
	});

	return { publish, unpublish };
};
