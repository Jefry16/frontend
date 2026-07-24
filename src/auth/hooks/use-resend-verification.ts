import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";

// Resend the account-verification email (POST /auth/resend-verification).
// Anti-enumeration: the backend responds the same whether or not the address is
// registered or already verified, so success here means only "request accepted"
// — never confirmation that an email exists. Public (in SKIP_AUTH_URLS).
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
