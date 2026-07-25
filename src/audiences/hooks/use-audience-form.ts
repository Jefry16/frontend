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
import type { Audience } from "../types";
import {
	type AudienceFields,
	type AudienceFormData,
	audienceSchema,
} from "../validators/audience";

// Create (no `audience`) or edit (with one). On success navigates to the
// detail page (create-navigates-to-detail rule). A 409 is specifically a
// duplicate name (unique per operator, case-insensitive).
export const useAudienceForm = (
	tourOperatorId: string,
	audience?: Audience,
) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<string, AxiosError, AudienceFields>(
		{
			mutationFn: async (fields) => {
				const base = `/tour-operators/${tourOperatorId}/audiences`;
				if (audience) {
					await authApi.patch(`${base}/${audience.id}`, fields);
					return audience.id;
				}
				// 201 Created with a Location header, no body — parse the new id out.
				const { headers } = await authApi.post(base, fields);
				const id = (headers.location ?? "").split("/").pop();
				if (!id) throw new Error("Missing Location header on create response");
				return id;
			},
			onSuccess: (audienceId) => {
				setErrorMessage(null);
				if (audience) {
					toast.updated(m.audience());
					queryClient.invalidateQueries({
						queryKey: queryKeys.audience(tourOperatorId, audienceId),
					});
				} else {
					toast.created(m.audience());
				}
				queryClient.invalidateQueries({
					queryKey: queryKeys.audiences(tourOperatorId),
				});
				navigate({
					to: "/tour-operators/$tourOperatorId/audiences/$audienceId",
					params: { tourOperatorId, audienceId },
				});
			},
			onError: (error) =>
				setErrorMessage(
					error.response?.status === 409
						? m.audience_name_taken()
						: apiErrorMessage(error),
				),
		},
	);

	const form = useForm({
		defaultValues: {
			name: audience?.name ?? "",
			paxPerUnit: audience ? String(audience.paxPerUnit) : "1",
		} as AudienceFormData,
		validators: { onSubmit: audienceSchema },
		onSubmit: ({ value }) => mutate(audienceSchema.parse(value)),
	});

	return { form, isPending, errorMessage, isEdit: !!audience };
};
