import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { authApi } from "#/lib/api";
import * as m from "#/paraglide/messages";
import { type RegisterFormData, registerSchema } from "../validators/register";

export const useRegisterForm = () => {
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		unknown,
		AxiosError,
		RegisterFormData
	>({
		mutationFn: ({ confirmPassword: _confirm, ...data }) =>
			authApi.post("/auth/register", data),
		// Not login: an unverified account would just 403 there.
		onSuccess: (_data, variables) => {
			setErrorMessage(null);
			navigate({
				to: "/auth/verify-email",
				search: { email: variables.email },
			});
		},
		onError: () => {
			// Anti-enumeration: a duplicate signup returns the same 201 as a fresh
			// one, so there is no "already registered" response to branch on. Any
			// error reaching here is an unexpected one.
			setErrorMessage(m.error());
		},
	});

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		} as RegisterFormData,
		validators: { onSubmit: registerSchema },
		onSubmit: ({ value }) => {
			// Re-parse so the schema's transforms apply — form state holds raw input.
			mutate(registerSchema.parse(value));
		},
	});

	return { form, isPending, errorMessage };
};
