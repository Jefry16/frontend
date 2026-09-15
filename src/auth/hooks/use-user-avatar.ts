import { useMutation } from "@tanstack/react-query";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";
import { useAuth } from "../AuthProvider";

export const useUserAvatar = () => {
	const { refreshUser } = useAuth();
	const toast = useAppToast();

	const set = useMutation<void, AxiosError, File>({
		mutationFn: async (file) => {
			const fd = new FormData();
			fd.append("file", file);
			await authApi.post("/auth/profile/avatar", fd);
		},
		onSuccess: async () => {
			await refreshUser();
			toast.success(m.avatar_updated());
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	const clear = useMutation<void, AxiosError, void>({
		mutationFn: async () => {
			await authApi.delete("/auth/profile/avatar");
		},
		onSuccess: async () => {
			await refreshUser();
			toast.success(m.avatar_removed());
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	return {
		set: set.mutate,
		clear: clear.mutate,
		isSetting: set.isPending,
		isClearing: clear.isPending,
	};
};
