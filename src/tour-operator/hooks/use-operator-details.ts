import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAuth } from "#/auth";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { TourOperatorDetails } from "../types";
import {
	type OperatorDetailsFormData,
	operatorDetailsSchema,
} from "../validators/operator-details";

export const operatorDetailQuery = (tourOperatorId: string) => ({
	queryKey: queryKeys.operatorDetails(tourOperatorId),
	queryFn: async () => {
		const { data } = await authApi.get<TourOperatorDetails>(
			`/tour-operators/${tourOperatorId}`,
		);
		return data;
	},
});

export const useOperatorDetails = (tourOperatorId: string) =>
	useQuery(operatorDetailQuery(tourOperatorId));

export const useOperatorDetailsForm = (
	tourOperatorId: string,
	operator: TourOperatorDetails,
) => {
	const { refreshUser } = useAuth();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		void,
		AxiosError,
		OperatorDetailsFormData
	>({
		mutationFn: async (fields) => {
			await authApi.patch(`/tour-operators/${tourOperatorId}`, fields);
		},
		onSuccess: async () => {
			setErrorMessage(null);
			await refreshUser();
			queryClient.invalidateQueries({
				queryKey: queryKeys.operatorDetails(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
			toast.success(m.operator_details_saved());
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const form = useForm({
		defaultValues: {
			name: operator.name,
			address: {
				address1: operator.address.address1,
				address2: operator.address.address2 ?? "",
				city: operator.address.city,
				province: operator.address.province ?? "",
				zip: operator.address.zip ?? "",
			},
			phone: operator.phone ?? "",
			email: operator.email ?? "",
			timezoneId: operator.timezoneId,
			currencyId: operator.currencyId,
		} as OperatorDetailsFormData,
		validators: { onSubmit: operatorDetailsSchema },
		onSubmit: ({ value }) => mutate(operatorDetailsSchema.parse(value)),
	});

	return { form, isPending, errorMessage, submit: mutate };
};
