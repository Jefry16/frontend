import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { OperatorLocales } from "#/session";
import {
	type OperatorLocalesFormData,
	operatorLocalesSchema,
} from "../validators/locales";

export const useOperatorLanguagesForm = (
	tourOperatorId: string,
	locales: OperatorLocales,
) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		void,
		AxiosError,
		OperatorLocalesFormData
	>({
		mutationFn: async (locales) => {
			// Both fields every time: a partial `locales` is a 422, and so is a primary
			// that is not among the supported set.
			await authApi.patch(`/tour-operators/${tourOperatorId}`, { locales });
		},
		onSuccess: () => {
			setErrorMessage(null);
			toast.updated(m.languages());
			queryClient.invalidateQueries({
				queryKey: queryKeys.operatorDetails(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const form = useForm({
		defaultValues: {
			primaryLocale: locales.primaryLocale,
			supportedLocales: locales.supportedLocales,
		} satisfies OperatorLocalesFormData,
		validators: { onSubmit: operatorLocalesSchema },
		onSubmit: ({ value }) => mutate(operatorLocalesSchema.parse(value)),
	});

	return { form, isPending, errorMessage };
};
