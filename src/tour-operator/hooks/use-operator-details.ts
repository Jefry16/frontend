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

/**
 * The operator's whole record — details AND the brand, seo, locales and
 * storefront-password sections that used to have routes of their own. Exported
 * so every section reads it through one definition, under one key: five cards on
 * this page asking five names for one record is five requests and five chances
 * to disagree with each other.
 */
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

/**
 * A genuine PATCH, unlike most writes here: an absent field is left unchanged
 * and a BLANK string clears an optional one. The form submits all six anyway,
 * so an untouched value re-sends itself and a cleared phone arrives as "".
 */
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
			// name and timezone are also on the auth profile's operator summary.
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
				// "" clears an optional line; the read returns null for an unset one.
				address2: operator.address.address2 ?? "",
				city: operator.address.city,
				province: operator.address.province ?? "",
				zip: operator.address.zip ?? "",
			},
			// "" clears; null would leave the column unchanged.
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
