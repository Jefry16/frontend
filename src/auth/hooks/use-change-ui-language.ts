import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import { type Locale, setLocale } from "#/paraglide/runtime";
import type { AuthUser } from "../types";

// Persists the user's admin-UI language (server-synced — follows the user across
// devices), then applies it via Paraglide. setLocale reloads the page so every
// message picks up the new catalog; the profile cache is updated first so the
// post-reload bootstrap agrees with the cookie and doesn't flip back.
export const useChangeUiLanguage = () => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	return useMutation<void, AxiosError, Locale>({
		mutationFn: async (language) => {
			await authApi.post("/auth/profile/language", { language });
		},
		onSuccess: (_, language) => {
			const profile = queryClient.getQueryData<AuthUser>(queryKeys.authProfile);
			if (profile) {
				queryClient.setQueryData<AuthUser>(queryKeys.authProfile, {
					...profile,
					language,
				});
			}
			setLocale(language);
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});
};
