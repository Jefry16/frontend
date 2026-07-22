import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import * as m from "#/paraglide/messages";
import { useAuth } from "../AuthProvider";
import type { AuthUser } from "../types";
import { getPostLoginPath } from "../utils";
import { type LoginFormData, loginSchema } from "../validators/login";

export const useLoginForm = () => {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		AuthUser,
		AxiosError,
		LoginFormData
	>({
		mutationFn: ({ email, password }) => login(email, password),
		onSuccess: (user) => {
			setErrorMessage(null);
			navigate({ to: getPostLoginPath(user) });
		},
		onError: (error) => {
			if (error.response?.status === 401) {
				setErrorMessage(m.invalid_credentials());
			} else if (error.response?.status === 403) {
				setErrorMessage(m.email_not_verified());
			} else {
				setErrorMessage(m.error());
			}
			form.setFieldValue("password", "");
		},
	});

	const form = useForm({
		defaultValues: { email: "", password: "" } as LoginFormData,
		validators: { onSubmit: loginSchema },
		onSubmit: ({ value }) => {
			mutate(loginSchema.parse(value));
		},
	});

	return { form, isPending, errorMessage };
};
