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
	emptyPriceRow,
	expandDepartures,
	type SlotFields,
	type SlotFormData,
	slotSchema,
} from "../validators/slot";

export const useSlotForm = (tourOperatorId: string, experienceId: string) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<void, AxiosError, SlotFields>({
		mutationFn: async (fields) => {
			await authApi.post(
				`/tour-operators/${tourOperatorId}/experiences/${experienceId}/slots`,
				{
					departures: expandDepartures(fields),
					audiencePrices: fields.audiencePrices,
				},
			);
		},
		onSuccess: () => {
			setErrorMessage(null);
			toast.created(m.availability());
			queryClient.invalidateQueries({
				queryKey: queryKeys.slots(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
			navigate({
				to: "/tour-operators/$tourOperatorId/availability",
				params: { tourOperatorId },
			});
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const form = useForm({
		defaultValues: {
			days: [],
			startTime: "",
			endTime: "",
			validFrom: "",
			validTo: "",
			audiencePrices: [emptyPriceRow()],
		} as SlotFormData,
		validators: { onSubmit: slotSchema },
		onSubmit: ({ value }) => mutate(slotSchema.parse(value)),
	});

	return { form, isPending, errorMessage };
};
