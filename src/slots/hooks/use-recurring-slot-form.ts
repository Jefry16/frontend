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
import {
	emptyPriceRow,
	type RecurringSlotFields,
	type RecurringSlotFormData,
	recurringSlotSchema,
} from "../validators/slot";

export const useRecurringSlotForm = (
	tourOperatorId: string,
	experienceId: string,
) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		void,
		AxiosError,
		RecurringSlotFields
	>({
		mutationFn: async (fields) => {
			await authApi.post(
				`/tour-operators/${tourOperatorId}/experiences/${experienceId}/slots`,
				fields,
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
		} as RecurringSlotFormData,
		validators: { onSubmit: recurringSlotSchema },
		onSubmit: ({ value }) => mutate(recurringSlotSchema.parse(value)),
	});

	return { form, isPending, errorMessage };
};
