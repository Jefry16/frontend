import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { useState } from "react";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";
import { useAuth } from "../AuthProvider";
import {
	type ChangePasswordFormData,
	changePasswordSchema,
} from "../validators/change-password";

export const useChangePasswordForm = () => {
	const toast = useAppToast();
	const navigate = useNavigate();
	const { logout } = useAuth();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		void,
		AxiosError,
		ChangePasswordFormData
	>({
		mutationFn: async ({ currentPassword, newPassword }) => {
			await authApi.post("/auth/change-password", {
				currentPassword,
				newPassword,
			});
		},
		onSuccess: async () => {
			setErrorMessage(null);
			toast.success(m.password_changed());
			await logout();
			navigate({ to: "/auth/login" });
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const form = useForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		} as ChangePasswordFormData,
		validators: { onSubmit: changePasswordSchema },
		onSubmit: ({ value }) => mutate(changePasswordSchema.parse(value)),
	});

	return { form, isPending, errorMessage };
};
