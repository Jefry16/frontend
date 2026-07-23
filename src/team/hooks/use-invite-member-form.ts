import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import * as m from "#/paraglide/messages";
import { type InviteFormData, inviteSchema } from "../validators/invite";

export const useInviteMemberForm = (tourOperatorId: string) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		unknown,
		AxiosError,
		InviteFormData
	>({
		mutationFn: (data) =>
			authApi.post(`/tour-operators/${tourOperatorId}/invitations`, data),
		onSuccess: () => {
			setErrorMessage(null);
			toast.success(m.invitation_sent());
			// Back to the roster (the invite is pending until accepted, so it won't
			// show among members — a pending-invitations view is a later slice).
			navigate({
				to: "/tour-operators/$tourOperatorId/settings/members",
				params: { tourOperatorId },
			});
		},
		onError: (error) => {
			// 409 = the email is already a member or already has a pending invite.
			setErrorMessage(
				error.response?.status === 409 ? m.invitation_duplicate() : m.error(),
			);
		},
	});

	const form = useForm({
		defaultValues: { name: "", email: "", role: "STAFF" } as InviteFormData,
		validators: { onSubmit: inviteSchema },
		onSubmit: ({ value }) => mutate(inviteSchema.parse(value)),
	});

	return { form, isPending, errorMessage };
};
