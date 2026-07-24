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
		// Registration sends a verification email; land on the "check your email"
		// screen (which can resend) rather than login, where an unverified account
		// would just 403.
		onSuccess: (_data, variables) => {
			setErrorMessage(null);
			navigate({
				to: "/auth/verify-email",
				search: { email: variables.email },
			});
		},
		onError: () => {
			// The backend never reveals whether an email is already registered:
			// a duplicate signup returns the same 201 as a fresh one (anti-
			// enumeration), and the existing owner is notified by email. So there
			// is no "email already exists" response to branch on — any error here
			// is an unexpected failure (network, 429, 5xx).
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
			// Re-parse so the schema's transforms apply (name is trimmed; the form
			// state keeps the raw input).
			mutate(registerSchema.parse(value));
		},
	});

	return { form, isPending, errorMessage };
};
