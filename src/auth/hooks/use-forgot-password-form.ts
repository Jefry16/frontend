import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { authApi } from "#/lib/api";
import * as m from "#/paraglide/messages";
import {
	type ForgotPasswordFormData,
	forgotPasswordSchema,
} from "../validators/forgot-password";

export const useForgotPasswordForm = () => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		unknown,
		AxiosError,
		ForgotPasswordFormData
	>({
		mutationFn: (data) => authApi.post("/auth/request-password-reset", data),
		onSuccess: (_data, variables) => {
			setErrorMessage(null);
			setSubmittedEmail(variables.email);
		},
		onError: () => setErrorMessage(m.error()),
	});

	const form = useForm({
		defaultValues: { email: "" } as ForgotPasswordFormData,
		validators: { onSubmit: forgotPasswordSchema },
		onSubmit: ({ value }) => mutate(forgotPasswordSchema.parse(value)),
	});

	return { form, isPending, errorMessage, submittedEmail };
};
