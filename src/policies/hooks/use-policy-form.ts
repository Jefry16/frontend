import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { Policy, PolicyTypeCode } from "../types";
import { policySchema } from "../validators/policy";

interface PolicyFormFields {
	type: PolicyTypeCode;
	title: string;
	body: string;
}

// The type is sent on create only. The backend's update input has no field for
// it, so an edit that sent one would be silently ignored rather than rejected —
// keeping it out of the PUT is what makes that visible.
export const usePolicyForm = (tourOperatorId: string, policy?: Policy) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		string,
		AxiosError,
		PolicyFormFields
	>({
		mutationFn: async (fields) => {
			const base = `/tour-operators/${tourOperatorId}/policies`;
			if (policy) {
				await authApi.put(`${base}/${policy.id}`, {
					title: fields.title,
					body: fields.body,
				});
				return policy.id;
			}
			// 201 with a Location header and no body.
			const { headers } = await authApi.post(base, {
				type: fields.type,
				title: fields.title,
				body: fields.body,
			});
			const id = (headers.location ?? "").split("/").pop();
			if (!id) throw new Error("Missing Location header on create response");
			return id;
		},
		onSuccess: (policyId) => {
			setErrorMessage(null);
			if (policy) {
				toast.updated(m.policy());
				queryClient.invalidateQueries({
					queryKey: queryKeys.policy(tourOperatorId, policyId),
				});
			} else {
				toast.created(m.policy());
			}
			queryClient.invalidateQueries({
				queryKey: queryKeys.policies(tourOperatorId),
			});
			// The mutation appended an audit entry.
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
			navigate({
				to: "/tour-operators/$tourOperatorId/content/policies/$policyId",
				params: { tourOperatorId, policyId },
			});
		},
		// 409 means the type is already written; the way out is editing that one.
		onError: (error) =>
			setErrorMessage(
				error.response?.status === 409
					? m.policy_type_taken()
					: apiErrorMessage(error),
			),
	});

	const form = useForm({
		defaultValues: {
			type: policy?.type ?? "CANCELLATION",
			title: policy?.title ?? "",
			body: policy?.body ?? "",
		} as PolicyFormFields,
		validators: { onSubmit: policySchema },
		onSubmit: ({ value }) => mutate(value),
	});

	return { form, isPending, errorMessage, isEdit: !!policy };
};
