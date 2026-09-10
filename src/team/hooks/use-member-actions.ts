import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { MemberRole } from "../types";

export const useMemberActions = (tourOperatorId: string, userId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const base = `/tour-operators/${tourOperatorId}/members/${userId}`;

	const invalidateRoster = () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.members(tourOperatorId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
	};

	const invalidateMember = () =>
		queryClient.invalidateQueries({
			queryKey: queryKeys.member(tourOperatorId, userId),
		});

	const changeRole = useMutation<unknown, AxiosError, MemberRole>({
		mutationFn: (role) => authApi.patch(base, { role }),
		onSuccess: () => {
			toast.success(m.role_changed());
			invalidateMember();
			invalidateRoster();
		},
		onError: () => toast.error(m.error()),
	});

	const transferOwnership = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.patch(base, { role: "OWNER" }),
		onSuccess: () => {
			toast.success(m.ownership_transferred());
			invalidateMember();
			invalidateRoster();
			queryClient.invalidateQueries({ queryKey: queryKeys.authProfile });
		},
		onError: () => toast.error(m.error()),
	});

	const remove = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.delete(base),
		onSuccess: invalidateRoster,
		onError: () => toast.error(m.error()),
	});

	return { changeRole, transferOwnership, remove };
};
