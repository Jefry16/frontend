import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";
import { useAuth } from "../AuthProvider";

// The signed-in user's avatar. Set is a single multipart POST (unlike the
// operator logo's two-step media flow); clear is a DELETE. Both refresh the auth
// profile so the shell + account card show the new avatar before the toast — the
// resolved avatarUrl lives only on the profile (no standalone user GET).
export const useUserAvatar = () => {
	const { refreshUser } = useAuth();
	const toast = useAppToast();

	const set = useMutation<void, AxiosError, File>({
		mutationFn: async (file) => {
			const fd = new FormData();
			fd.append("file", file);
			// Let axios set the multipart boundary from the FormData — never hand-set
			// Content-Type.
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
