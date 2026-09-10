import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

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
		mutationFn: () => authApi.put(`${base}/published`, { published: true }),
		onSuccess: () => {
			toast.success(m.experience_published());
			invalidate();
		},
		onError: () => toast.error(m.error()),
	});

	const unpublish = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.put(`${base}/published`, { published: false }),
		onSuccess: () => {
			toast.success(m.experience_unpublished());
			invalidate();
		},
		onError: () => toast.error(m.error()),
	});

	return { publish, unpublish };
};
