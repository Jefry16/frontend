import { useMutation } from "@tanstack/react-query";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";

export const useResendVerification = () => {
	const toast = useAppToast();

	return useMutation<void, AxiosError, string>({
		mutationFn: async (email) => {
			await authApi.post("/auth/resend-verification", { email });
		},
		onSuccess: () => toast.success(m.verification_email_sent()),
		onError: (error) => toast.error(apiErrorMessage(error)),
	});
};
