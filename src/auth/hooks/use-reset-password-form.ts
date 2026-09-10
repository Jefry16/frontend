import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import * as m from "#/paraglide/messages";
import {
	type ResetPasswordFormData,
	resetPasswordSchema,
} from "../validators/reset-password";

export const useResetPasswordForm = (token: string) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		unknown,
		AxiosError,
		ResetPasswordFormData
	>({
		mutationFn: ({ password }) =>
			authApi.post("/auth/reset-password", { token, newPassword: password }),
		onSuccess: () => {
			setErrorMessage(null);
			toast.success(m.reset_password_success());
			navigate({ to: "/auth/login" });
		},
		onError: (error) => {
			const status = error.response?.status;
			if (status === 401) {
				setErrorMessage(m.reset_link_invalid());
			} else if (status === 422) {
				setErrorMessage(m.reset_password_same());
			} else {
				setErrorMessage(m.error());
			}
		},
	});

	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		} as ResetPasswordFormData,
		validators: { onSubmit: resetPasswordSchema },
		onSubmit: ({ value }) => mutate(resetPasswordSchema.parse(value)),
	});

	return { form, isPending, errorMessage };
};
