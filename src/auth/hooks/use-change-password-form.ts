import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";
import {
	type ChangePasswordFormData,
	changePasswordSchema,
} from "../validators/change-password";

// Change the signed-in user's password (POST /auth/change-password). Sends only
// current + new; the confirmation is a client-side check. Resets the form on
// success so the fields clear.
export const useChangePasswordForm = () => {
	const toast = useAppToast();
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
		onSuccess: () => {
			setErrorMessage(null);
			toast.success(m.password_changed());
			form.reset();
		},
		// A wrong current password comes back as a 4xx; surface it inline.
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
