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
				// 201 Created with a Location header, no body — parse the new id out.
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
				// The invite appended an audit entry — refresh the trail.
				queryClient.invalidateQueries({
					queryKey: queryKeys.activity(tourOperatorId),
				});
				// The new invitation's detail (create-navigates-to-detail rule) — it
				// shows the pending status and carries the resend/revoke actions.
				navigate({
					to: "/tour-operators/$tourOperatorId/settings/invitations/$invitationId",
					params: { tourOperatorId, invitationId },
				});
			},
			onError: (error) => {
				// 409 = the email is already a member or already has a pending invite.
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
