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

/** The operator's own record — the only read of it in the app. */
export const useOperatorDetails = (tourOperatorId: string) =>
	useQuery({
		queryKey: queryKeys.operatorDetails(tourOperatorId),
		queryFn: async () => {
			const { data } = await authApi.get<TourOperatorDetails>(
				`/tour-operators/${tourOperatorId}`,
			);
			return data;
		},
	});

/**
 * Saves the details. A genuine PATCH, unlike most writes here: the backend
 * leaves an absent field unchanged and clears an optional one on a BLANK
 * string. So the form submits all six every time — an untouched value re-sends
 * itself and changes nothing, and a cleared phone arrives as "" and clears.
 * Nothing is written when nothing changed, so a no-op save records no audit
 * entry either.
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
			// name and timezone both live on the auth profile's operator summary —
			// the switcher label and every operator-timezone formatter read it there.
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
			address: operator.address,
			// Optional columns: the backend clears one with "" rather than an absent
			// field, so empty stays empty instead of collapsing to null.
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
