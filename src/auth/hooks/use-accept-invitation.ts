import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";
import { useAuth } from "../AuthProvider";
import type { AcceptInvitationResponse } from "../types";
import {
	type AcceptInvitationFormData,
	acceptInvitationSchema,
} from "../validators/accept-invitation";

export const useAcceptInvitation = (token: string) => {
	const { refreshUser, establishSession } = useAuth();
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [accepted, setAccepted] = useState(false);

	const { mutate, isPending } = useMutation<
		AcceptInvitationResponse,
		AxiosError,
		AcceptInvitationFormData | undefined
	>({
		mutationFn: async (body) => {
			const { data } = await authApi.post<AcceptInvitationResponse>(
				`/invitations/${token}/accept`,
				body ?? {},
			);
			return data;
		},
		onSuccess: async (data) => {
			setErrorMessage(null);
			setAccepted(true);
			if (data.accessToken) await establishSession(data.accessToken);
			else await refreshUser();
			navigate({
				to: "/tour-operators/$tourOperatorId",
				params: { tourOperatorId: data.id },
			});
		},
		onError: (error) => {
			const status = error.response?.status;
			if (status === 409) setErrorMessage(apiErrorMessage(error));
			else if (status === 403) setErrorMessage(m.invitation_email_mismatch());
			else if (status === 410) setErrorMessage(m.invitation_expired());
			else if (status === 404) setErrorMessage(m.invitation_link_invalid());
			else setErrorMessage(m.error());
		},
	});

	const form = useForm({
		defaultValues: { name: "", password: "" } as AcceptInvitationFormData,
		validators: { onSubmit: acceptInvitationSchema },
		onSubmit: ({ value }) => mutate(acceptInvitationSchema.parse(value)),
	});

	return {
		form,
		isPending,
		errorMessage,
		accepted,
		acceptAsCurrentUser: () => mutate(undefined),
	};
};
