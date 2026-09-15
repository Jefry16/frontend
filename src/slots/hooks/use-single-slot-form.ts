import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { useState } from "react";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import {
	composeStartEnd,
	emptyPriceRow,
	type SingleSlotFields,
	type SingleSlotFormData,
	singleSlotSchema,
} from "../validators/slot";

export const useSingleSlotForm = (
	tourOperatorId: string,
	experienceId: string,
) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		string,
		AxiosError,
		SingleSlotFields
	>({
		mutationFn: async (fields) => {
			const { startAt, endAt } = composeStartEnd(fields);
			const { headers } = await authApi.post(
				`/tour-operators/${tourOperatorId}/experiences/${experienceId}/slot`,
				{ startAt, endAt, audiencePrices: fields.audiencePrices },
			);
			const id = (headers.location ?? "").split("/").pop();
			if (!id) throw new Error("Missing Location header on create response");
			return id;
		},
		onSuccess: (slotId) => {
			setErrorMessage(null);
			toast.created(m.availability());
			queryClient.invalidateQueries({
				queryKey: queryKeys.slots(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
			navigate({
				to: "/tour-operators/$tourOperatorId/availability/$slotId",
				params: { tourOperatorId, slotId },
			});
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const form = useForm({
		defaultValues: {
			date: "",
			startTime: "",
			endTime: "",
			audiencePrices: [emptyPriceRow()],
		} as SingleSlotFormData,
		validators: { onSubmit: singleSlotSchema },
		onSubmit: ({ value }) => mutate(singleSlotSchema.parse(value)),
	});

	return { form, isPending, errorMessage };
};
