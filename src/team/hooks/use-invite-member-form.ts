import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { type InviteFormData, inviteSchema } from "../validators/invite";

export const useInviteMemberForm = (tourOperatorId: string) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<string, AxiosError, InviteFormData>(
		{
			mutationFn: async (data) => {
				const { headers } = await authApi.post(
					`/tour-operators/${tourOperatorId}/invitations`,
					data,
				);
				const id = (headers.location ?? "").split("/").pop();
				if (!id) throw new Error("Missing Location header on create response");
				return id;
			},
			onSuccess: (invitationId) => {
				setErrorMessage(null);
				toast.success(m.invitation_sent());
				queryClient.invalidateQueries({
					queryKey: queryKeys.invitations(tourOperatorId),
				});
				queryClient.invalidateQueries({
					queryKey: queryKeys.activity(tourOperatorId),
				});
				navigate({
					to: "/tour-operators/$tourOperatorId/settings/invitations/$invitationId",
					params: { tourOperatorId, invitationId },
				});
			},
			onError: (error) => {
				setErrorMessage(
					error.response?.status === 409 ? m.invitation_duplicate() : m.error(),
				);
			},
		},
	);

	const form = useForm({
		defaultValues: { name: "", email: "", role: "STAFF" } as InviteFormData,
		validators: { onSubmit: inviteSchema },
		onSubmit: ({ value }) => mutate(inviteSchema.parse(value)),
	});

	return { form, isPending, errorMessage };
};
